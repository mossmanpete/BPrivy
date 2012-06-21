#ifndef H_BP_ErrorHandling
#define H_BP_ErrorHandling

#include "APITypes.h"
#include <string> // for std::string
#include <cstdint> // for uint64_t and uint32_t
#include <boost/filesystem.hpp>
#include "Utils.h"
#include "BPi18n.h"

// Error Handling Stuff
namespace bp
{
	const std::wstring& SCodeToACodeW(std::uint32_t err);
	const std::wstring SCodeToSCodeW(std::uint32_t err);
	const bp::uwstring& PCodeToACodeW(int ev);
	//const bp::ustring&& PCodeToPCodeW(int ev);
	//const std::string SCodeToPCode(std::uint32_t err);

	// String Constants (make sure they're all UTF8 encoded)
	extern const std::string PROP_SYSTEM_MESSAGE;
	extern const std::string PROP_GENERIC_MESSAGE;
	extern const std::string PROP_SYSTEM_CODE;
	extern const std::string PROP_GENERIC_CODE;
	extern const std::string PROP_A_CODE;
	extern const std::string PROP_ERROR;
	extern const std::string PROP_INFO;
	extern const std::string PROP_LSFILE;
	extern const std::string PROP_LSDIR;
	extern const std::string PROP_FILES;
	extern const std::string PROP_DIRS;
	extern const std::string PROP_OTHERS;
	extern const std::string PROP_ERRORS;
	extern const std::string PROP_PATH;
	extern const std::string PROP_PATH2;
	extern const std::string PROP_FILENAME;
	extern const std::string PROP_FILEEXT;
	extern const std::string PROP_FILESTEM;
	extern const std::string PROP_FILESIZE;
	extern const std::string PROP_DATA;
	extern const std::string PROP_READFILE;
	extern const std::string PROP_HIDE;
	extern const std::string PROP_FILE_FILTER;
	extern const std::string PROP_DIALOG_TITLE;

	/***** Actionable Codes. GENERIC & System Error Codes are mapped to one of these *****/
 	// User Actionable. User should resolve the situation
 	// and retry.
 	extern const bp::uwstring ACODE_ACCESS_DENIED;
 	// User Actionable. Please retry after some
 	// time.
 	extern const bp::uwstring ACODE_RESOURCE_LOCKED;
 	// User Actionable. Please supply correct path or retry
 	// after situation is resolved. Bad path for read or
 	// write.
 	extern const bp::uwstring ACODE_BAD_PATH_ARGUMENT;
 	// User Or Client Error: Bad pathname syntax for creates or moves
 	// Depending on situation either prompt client to provide a
 	// correct pathname or auto-correct.
 	extern const bp::uwstring ACODE_INVALID_PATHNAME;
 	// This is a system/environment problem that can be
 	// observed and are in the user's control. Things
 	// like network drive not available, or disk-full. User
 	// should resolve the situation and retry the operation.
 	extern const bp::uwstring ACODE_RESOURCE_UNAVAILABLE;
 	// The situation is not fatal. It occurred owing to
 	// client/system error. Look at the specific code,
 	// autofix and auto-retry without prompting the user.
 	extern const bp::uwstring ACODE_AUTORETRY;
 	// This situation cannot be resolved either through user
 	// intervention or by auto-fix. We don't have an automatic
 	// resolution at this stage. Call customer support.
 	extern const bp::uwstring ACODE_CANT_PROCEED;
 	// Unmapped System Code
 	extern const bp::uwstring ACODE_UNMAPPED;

	//typedef enum _ACODE
	//{
	//	// Unmapped System Code
	//	ACODE_UNMAPPED = 0,
	//	// User Actionable. User should resolve the situation
	//	// and retry.
	//	ACODE_ACCESS_DENIED,
	//	// User Actionable. Please retry after some
	//	// time.
	//	ACODE_RESOURCE_LOCKED,
	//	// User Actionable. Please supply correct path or retry
	//	// after situation is resolved. Bad path for read or
	//	// write.
	//	ACODE_BAD_PATH_ARGUMENT,
	//	// User Or Client Error: Bad pathname syntax for creates or moves
	//	// Depending on situation either prompt client to provide a
	//	// correct pathname or auto-correct.
	//	ACODE_INVALID_PATHNAME,
	//	// This is a system/environment problem that can be
	//	// observed and are in the user's control. Things
	//	// like network drive not available, or disk-full. User
	//	// should resolve the situation and retry the operation.
	//	ACODE_RESOURCE_UNAVAILABLE,
	//	// The situation is not fatal. It occurred owing to
	//	// client/system error. Look at the specific code,
	//	// autofix and auto-retry without prompting the user.
	//	ACODE_AUTORETRY,
	//	// This situation cannot be resolved either by user
	//	// action or by auto-fix. We don't have an automatic
	//	// resolution at this stage.
	//	ACODE_CANT_PROCEED,

	//	// Insert codes above this point.
	//	ACODE_NUM
	//} ACODE;

	//template<typename CODE, size_t NUM, CODE UNMAPPED>
	//class Codes
	//{
	//public:
	//	Codes();
	//	inline const uwstring& ucs(CODE c) const
	//		{return _ucs[c<NUM?c:UNMAPPED];};
	//private:
	//	bp::ustring	_utf8[NUM];
	//	bp::uwstring _ucs[NUM];
	//};
	//typedef Codes<ACODE, ACODE_NUM, ACODE_UNMAPPED> ACodes;
	//extern const ACodes Acode;


	//typedef enum _BPCODE
	//{
	//	BPCODE_UNMAPPED = 0,
	//	BPCODE_UNAUTHORIZED_CLIENT,
	//	BPCODE_WRONG_PASS,
	//	BPCODE_NEW_FILE_CREATED,
	//	BPCODE_NO_MEM,
	//	BPCODE_ASSERT_FAILED,
	//	BPCODE_PATH_EXISTS,
	//	BPCODE_PATH_NOT_EXIST,
	//	BPCODE_BAD_FILETYPE,
	//	BPCODE_REPARSE_POINT,
	//	BPCODE_IS_SYMLINK,
	//	BPCODE_WOULD_CLOBBER,
	//	// All codes to be inserted above this point
	//	BPCODE_NUM
	//} BPCODE;

	//typedef Codes<BPCODE, BPCODE_NUM, BPCODE_UNMAPPED> BPCodes;
	//extern const BPCodes BPcode;

	// Second level codes for providing more information. These manifest as generic-code ('gcd')
	// in the error object ('err') returned to javascript.
	extern const bp::uwstring BPCODE_UNAUTHORIZED_CLIENT;// Unauthorized client trying to access the API.
	extern const bp::uwstring BPCODE_WRONG_PASS; // Password too short or wrong.
	extern const bp::uwstring BPCODE_NEW_FILE_CREATED;// Informational. New File was created.
	extern const bp::uwstring BPCODE_NO_MEM;//Could not allocate memory
	extern const bp::uwstring BPCODE_ASSERT_FAILED;//Logic Error
	extern const bp::uwstring BPCODE_PATH_EXISTS;
	extern const bp::uwstring BPCODE_PATH_NOT_EXIST;
	extern const bp::uwstring BPCODE_BAD_FILETYPE;
	extern const bp::uwstring BPCODE_REPARSE_POINT;
	extern const bp::uwstring BPCODE_IS_SYMLINK;
	extern const bp::uwstring BPCODE_WOULD_CLOBBER;//Exception thrown to prevent clobbering

	// Integer constants
	extern const msize32_t MAX_READ_BYTES;

	#define CATCH_FILESYSTEM_EXCEPTIONS(p) \
		catch (const bfs::filesystem_error& e)\
		{\
			HandleFilesystemException(e, p);\
		}\
		catch (const bp::BPError& e)\
		{\
			HandleBPError(e, p);\
		}\
		catch (const bs::system_error& e)\
		{\
			HandleSystemException(e, p);\
		}\
		catch (const std::exception& e)\
		{\
			HandleStdException(e, p);\
		}\
		catch (...)\
		{\
			HandleUnknownException(p);\
		}

	// JSON related constants
	extern const std::string QUOTE;
	extern const std::string COMMA;
	extern const std::string OPENB;
	extern const std::string CLOSEB;

	namespace bs = boost::system;
	namespace bfs = boost::filesystem;
	using namespace std;

	struct BPError
	{
		BPError(const wstring& ac) : acode(ac) {}
		BPError(const wstring& ac, const wstring& gc) : acode(ac), gcode(gc) {}
		BPError(const wstring& ac, const wstring& gc, const wstring& gmsg)
			: acode(ac), gcode(gc), gmsg(gmsg) {}
		BPError(const wstring& ac, const wstring& gc, const bfs::path& pth)
			: acode(ac), gcode(gc), path(pth.string()) {}
		wstring acode;
		wstring gcode;
		string path;
		wstring gmsg;
	};

	void MakeErrorEntry(const boost::filesystem::filesystem_error& e, bp::VariantMap& m);
	void HandleFilesystemException (const bfs::filesystem_error& e, bp::JSObject* p);
	void HandleSystemException(const bs::system_error& e, bp::JSObject* p);
	void ParseSystemException(const bs::system_error& e, bp::VariantMap& m);
	void HandleStdException(const std::exception& e, bp::JSObject* p);
	void HandleUnknownException (bp::JSObject* p);
	void HandleUnknownException (bp::VariantMap& me);
	void HandleBPError(const BPError&, bp::JSObject*);
	void SetInfoMsg(const std::wstring& code, bp::JSObject*);

#define CHECK(b) \
	if (!b)\
	{\
		throw BPError(ACODE_CANT_PROCEED, bp::BPCODE_ASSERT_FAILED);\
	}

#define ASSERT(b) CHECK(b)

} // end namespace bp
// Didn't have time to put everything into namespace bp
void ThrowLastSystemError(const boost::filesystem::path& pth);
#endif // H_BP_ErrorHandling