export type TAudioFileType = "mp3" | "wav" | "ogg" | "m4a" | "webm" | "3gp"

export type TVideoFileType =
	| "mp4"
	| "webm"
	| "ogg"
	| "mov"
	| "avi"
	| "wmv"
	| "flv"
	| "mkv"
	| "m4v"
	| "mpg"
	| "mpeg"
	| "3gp"
	| "3g2"

export type TImageFileType = "jpg" | "jpeg" | "png" | "gif" | "webp"

export type TDocumentFileType =
	| "ppt"
	| "pptx"
	| "doc"
	| "docx"
	| "pdf"
	| "xls"
	| "xlsx"

export type TCodeFileName =
	| "bat"
	| "c"
	| "cpp"
	| "csharp"
	| "css"
	| "dockerfile"
	| "go"
	| "graphql"
	| "html"
	| "java"
	| "javascript"
	| "json"
	| "kotlin"
	| "less"
	| "lua"
	| "markdown"
	| "mysql"
	| "pascal"
	| "perl"
	| "pgsql"
	| "php"
	| "powershell"
	| "pug"
	| "python"
	| "r"
	| "redis"
	| "ruby"
	| "rust"
	| "scss"
	| "shell"
	| "sol"
	| "sql"
	| "swift"
	| "typescript"
	| "xml"
	| "yaml"
	| "csv"

export type TCodeFileExt =
	| "bat"
	| "c"
	| "cpp"
	| "cs"
	| "css"
	| "dockerfile"
	| "go"
	| "graphql"
	| "html"
	| "java"
	| "js"
	| "jsx"
	| "vue"
	| "ang"
	| "json"
	| "kt"
	| "less"
	| "lua"
	| "md"
	| "mdx"
	| "sql"
	| "pas"
	| "pl"
	| "pgsql"
	| "php"
	| "ps1"
	| "pug"
	| "py"
	| "r"
	| "conf"
	| "rb"
	| "rs"
	| "scss"
	| "sh"
	| "sol"
	| "sql"
	| "swift"
	| "ts"
	| "tsx"
	| "xml"
	| "yaml"
	| "csv"

export interface ICodeFileType {
	name: TCodeFileName
	ext: TCodeFileExt[]
}

export type TFileExtType =
	| TAudioFileType
	| TVideoFileType
	| TImageFileType
	| TDocumentFileType
	| TCodeFileExt

export interface IFileTypes {
	audio: TAudioFileType[]
	video: TVideoFileType[]
	image: TImageFileType[]
	document: TDocumentFileType[]
	code: ICodeFileType[]
}

export type TFileExt =
	// archive
	| "zip"
	| "rar"
	| "tar"
	| "gz"
	| "bz2"
	| "7z"
	| "7zip"
	| "exe"
	| "dmg"
	| "iso"
	// audio
	| "mp3"
	| "wav"
	| "flac"
	| "aac"
	| "ogg"
	// code
	| "js"
	| "ts"
	| "jsx"
	| "tsx"
	| "html"
	| "css"
	| "json"
	| "xml"
	| "php"
	| "py"
	| "rb"
	// csv
	| "csv"
	// excel
	| "xls"
	| "xlsx"
	// image
	| "jpg"
	| "jpeg"
	| "png"
	| "gif"
	| "bmp"
	| "svg"
	| "tiff"
	| "ico"
	// pdf
	| "pdf"
	// powerpoint
	| "ppt"
	| "pptx"
	// text
	| "txt"
	| "rtf"
	| "md"
	// video
	| "mp4"
	| "avi"
	| "mkv"
	| "mov"
	| "wmv"
	| "flv"
	// image
	| "jpg"
	| "jpeg"
	| "png"
	| "gif"
	| "webp"
	// word
	| "doc"
	| "docx"
	| "odt"
