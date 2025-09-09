import FileTypes from "@/constants/fileTypes"
import type {
	TAudioFileType,
	TCodeFileExt,
	TDocumentFileType,
	TImageFileType,
	TVideoFileType,
} from "@/types/file"
import { useMemo } from "react"

const useFileType = ({ ext }: { ext?: string }) => {
	return useMemo(() => {
		const isImage = FileTypes.image.includes(ext as TImageFileType)
		const isAudio = FileTypes.audio.includes(ext as TAudioFileType)
		const isDocument = FileTypes.document.includes(ext as TDocumentFileType)
		const isVideo = FileTypes.video.includes(ext as TVideoFileType)
		const isCode = FileTypes.code.find(f =>
			f.ext.includes(ext as TCodeFileExt)
		)
		const isLink = ext === "link"
		const isPDF = ext === "pdf"
		const isOther =
			!isImage && !isDocument && !isVideo && !isCode && !isPDF && !isAudio

		return {
			isImage,
			isAudio,
			isDocument,
			isVideo,
			isCode,
			isPDF,
			isLink,
			isOther,
		}
	}, [ext])
}

export default useFileType
