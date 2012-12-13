#include <libscrypt.h>
#include "CryptCtx.h"
#include "Utils.h"
#include "Error.h"
#include "Format.h"
#include <cstdio> // for sprintf
#include <openssl/rand.h>
#include <openssl/err.h>

namespace crypt
{
	using std::wstring;
	void
	initLibcrypt()
	{
		//May hog memory.
		ERR_load_crypto_strings();
	}

	void 
	unloadLibcrypt()
	{
		ERR_free_strings();
	}

	/*****************************************************************/
	/***************************** Error *****************************/
	/*****************************************************************/
	const wstring Error::CODE_BAD_PARAM = L"BadParameter";
	const wstring Error::CODE_NO_MEM = L"NoMemory";
	const wstring Error::CODE_OS_ERROR = L"OSError";
	const wstring Error::CODE_CRYPTO_ERROR = L"CryptoError";
	const wstring Error::CODE_INTERNAL_ERROR = L"InternalError";
	const wstring Error::CODE_NO_CSP = L"NoCSP";
	const wstring Error::CODE_BAD_FMT = L"WrongFormatVer";
	const wstring Error::CODE_FEATURE_NOT_SUPPORTED = L"FeatureNotSupported";
	const wstring Error::MSG_EMPTY = L"";

	void
	Error::ThrowOpensslError()
	{
		unsigned long err = ERR_peek_last_error();
		ERR_clear_error();
		if (err) {
			throw Error(Error::CODE_CRYPTO_ERROR, ERR_error_string(err, NULL));
		}
		else {
			throw Error(Error::CODE_INTERNAL_ERROR);
		}
	}

	void
	Error::Assert(bool cond, const wstring& c, const wstring& m)
	{
		if (!cond) {
			throw Error(c, m);
		}
	}

	wstring
	Error::PrintMsg() const
	{
		return code + L":" + msg + L":" + std::to_wstring((unsigned long long)errc);
	}

	/*****************************************************************/
	/************************** CryptInfo ****************************/
	/*****************************************************************/

	CryptInfo::CryptInfo(CipherEnum cipher, size_t keyLen) :
		m_logN(LOGN), m_r(R), m_p(P),
		m_cipher(cipher), m_keyLen(keyLen)
	{
		RAND_bytes(static_cast<unsigned char*>(m_salt), m_salt.size());
		ConstructCommon(m_cipher);
	}
	CryptInfo::CryptInfo(const Buf<uint8_t>& cryptInfo)
	{
		FormatCryptInfo1::parse(cryptInfo, *this);
		ConstructCommon(m_cipher);
	}
	void
	CryptInfo::ConstructCommon(CipherEnum cipher)
	{
		switch(cipher)
		{
		case CIPHER_AES_CBC:
			m_EVP_CIPHER = EVP_aes_256_cbc();
			break;
		case CIPHER_BF_CBC:
			m_EVP_CIPHER = EVP_bf_cbc();
			break;
		default:
			throw Error(Error::CODE_BAD_PARAM, L"Cipher name not supplied");
		}
		m_ivLen = EVP_CIPHER_iv_length(m_EVP_CIPHER);
		m_blkSize = EVP_CIPHER_block_size(m_EVP_CIPHER);
	}

	void
	CryptInfo::zero()
	{
		m_logN = m_r = m_p = m_keyLen = 0;
		m_cipher = CPHR_NULL;
		m_salt.zero();
		m_signature.zero();
	}

	/*****************************************************************/
	/************************** CipherBlob ***************************/
	/*****************************************************************/
	void
	CipherBlob::zero()
	{
		m_buf.zero();
		m_iv.zero();
		m_headerSize = m_dataSize = 0;
	}
	CipherBlob::CipherBlob(CipherBlob&& other)
	  : m_buf(std::forward<ByteBuf>(other.m_buf)),
	    m_iv(std::forward<ByteBuf>(other.m_iv)),
		m_headerSize(other.m_headerSize),
		m_dataSize(other.m_dataSize)
	{
		other.zero(); // paranoia
	}
	CipherBlob&
	CipherBlob::operator=(CipherBlob&& other)
	{
		if (this == &other) return *this;
		
		m_buf = std::forward<ByteBuf>(other.m_buf);
		m_iv = std::forward<ByteBuf>(other.m_iv);
		m_headerSize = m_headerSize;
		m_dataSize = other.m_dataSize;

		other.zero();
		return *this;
	}
	CipherBlob::CipherBlob(ByteBuf&& iv, size_t tentativeDataSize)
		: m_buf(CipherBlobFormat1::EstimateTotalSize(iv.usefulLength(), tentativeDataSize)),
		m_headerSize(CipherBlobFormat1::EstimateHeaderSize(iv.usefulLength(), tentativeDataSize)),
		m_iv(std::forward<ByteBuf>(iv)),
		m_dataSize(0)
	{}
	void CipherBlob::serialize(size_t dataSize)
	{
		// marshall the header.
		Error::Assert((dataSize>0), Error::CODE_BAD_PARAM,
			L"CipherBlob::serialize. Encrypted size is zero");
		m_buf.setUsefulLength(dataSize + m_headerSize);
		m_dataSize = dataSize;
		CipherBlobFormat1::serializeHeader(*this);
	}

	CipherBlob::CipherBlob(BufHeap<uint8_t>&& data)
		: m_buf(std::forward<BufHeap<uint8_t> >(data)),
		m_iv()
	{
		CipherBlobFormat1::parseHeader(*this);
	}
	
	uint8_t*
	CipherBlob::getDataBuf()
	{
		return static_cast<uint8_t*>(m_buf) + m_headerSize;
	}

	/*****************************************************************/
	/*************************** CryptCtx ****************************/
	/*****************************************************************/
	CryptCtx::map CryptCtx::s_ctxMap;
	unsigned int CryptCtx::s_lastHandle = 0;

	CryptCtx::CryptCtx(const Buf<uint8_t>& cryptInfo) : m_info(cryptInfo)
	{}
	CryptCtx::CryptCtx(CipherEnum cipher, unsigned int keyLen) : 
		m_info(cipher, keyLen)
	{}
	void
	CryptCtx::zero()
	{
		m_dk.zero();
	}
	const CryptCtx& CryptCtx::Get(unsigned int handle)
	{
		if (handle==0) {throw Error(Error::CODE_BAD_PARAM);}
		else try {
			CryptCtx* p = s_ctxMap.at(handle);
			if (p) {return *p;}
			else {throw Error(Error::CODE_BAD_PARAM, L"Internal Error");}
		} catch (std::exception& e)
		{
			throw Error(Error::CODE_BAD_PARAM, LocaleToUnicode(e.what()));
		}
	}
	void CryptCtx::Destroy(unsigned int handle)
	{
		try {
			CryptCtx* p = s_ctxMap.at(handle);
			if (p) {delete p;}
			CryptCtx::s_ctxMap.erase(handle);
		}
		catch (std::exception& e) {
			throw Error(Error::CODE_BAD_PARAM, LocaleToUnicode(e.what()));
		}
	}
	unsigned int
	CryptCtx::Make(Buf<wchar_t>& $, CipherEnum cipher, unsigned int key_len)
	{
		unsigned int handle = 0;
		CryptCtx* pCtx = new CryptCtx(cipher, key_len);
		if (!pCtx) {throw Error(Error::CODE_NO_MEM);}

		const CryptInfo& info = pCtx->m_info;
		if (!deriveKey($, info.m_logN, info.m_r, info.m_p, pCtx->m_dk, info.m_salt)) {
			throw Error(Error::CODE_OS_ERROR, L"Could not derive key");
		}
		$.zero();

		handle = CryptCtx::MakeHandle();
		s_ctxMap.insert(CryptCtx::map::value_type(handle, pCtx));

		return handle;
	}
	unsigned int
	CryptCtx::Make(Buf<wchar_t>& $, const Buf<uint8_t>& cryptInfo)
	{
		unsigned int handle = 0;
		std::string headerHex;

		CryptCtx* pCtx = new CryptCtx(cryptInfo);
		if (!pCtx) {throw Error(Error::CODE_NO_MEM);}

		const CryptInfo& info = pCtx->m_info;
		deriveKey($, info.m_logN, info.m_r, info.m_p, pCtx->m_dk, info.m_salt);
		// zero out passwd
		$.zero();
		FormatCryptInfo1::Verify(cryptInfo, *pCtx);

		handle = CryptCtx::MakeHandle();
		s_ctxMap.insert(CryptCtx::map::value_type(handle, pCtx));

		return handle;
	}
	void
	CryptCtx::Encrypt(const std::string& in, CipherBlob& out) const
	{
		const static size_t MAX_HEADER_SIZE = 9;
		EVP_CIPHER_CTX ctx;
		EVP_CIPHER_CTX_init(&ctx);

		try
		{
			size_t ivLength = EVP_CIPHER_iv_length(m_info.m_EVP_CIPHER);
			BufHeap<uint8_t> iv(ivLength, ivLength);
			RAND_bytes(static_cast<unsigned char*>(iv), ivLength);
			EVP_EncryptInit_ex(&ctx, m_info.m_EVP_CIPHER, NULL, NULL, NULL);
			EVP_CIPHER_CTX_set_key_length(&ctx, m_info.m_keyLen);
			EVP_EncryptInit_ex(&ctx, NULL, NULL, m_dk, iv);

			CipherBlob cText(std::move(iv), in.size() + m_info.m_blkSize);
			uint8_t* dataBuf = cText.getDataBuf();

			int outlen = 0;
			if(!EVP_EncryptUpdate(&ctx,
								  dataBuf, 
								  &outlen,
								  (const unsigned char*)in.data(), 
								  in.size()))
			{
				Error::ThrowOpensslError();
			}

			int finlen = 0;
			if(!EVP_EncryptFinal_ex(&ctx, &(dataBuf[outlen]), &finlen))
			{
				Error::ThrowOpensslError();
			}

			outlen += finlen;
			EVP_CIPHER_CTX_cleanup(&ctx);

			//cText.putEncryptedSize(outlen);
			cText.serialize(outlen);
			out = std::move(cText);
		}
		catch (...)
		{
			EVP_CIPHER_CTX_cleanup(&ctx);
			throw;
		}
	}
	void
	CryptCtx::serializeInfo(BufHeap<uint8_t>& outBuf) const
	{
		BufHeap<uint8_t> tempBuf(FormatCryptInfo1::FMT_TOTAL_SIZE);
		FormatCryptInfo1::serialize(m_info, tempBuf, *this);
		outBuf = std::move(tempBuf);
	}
}