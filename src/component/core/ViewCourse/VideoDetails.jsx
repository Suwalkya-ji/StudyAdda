import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import ReactPlayer from "react-player"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import IconBtn from "../../common/IconBtn"

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()

  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState(null)
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!courseSectionData.length) return

    if (!courseId || !sectionId || !subSectionId) {
      navigate("/dashboard/enrolled-courses")
      return
    }

    const section = courseSectionData.find(
      (sec) => sec._id === sectionId
    )

    const subSection = section?.subSection.find(
      (sub) => sub._id === subSectionId
    )

    setVideoData(subSection)
    setPreviewSource(courseEntireData.thumbnail)
    setVideoEnded(false)
  }, [courseSectionData, courseEntireData, location.pathname])

  const isFirstVideo = () => {
    const sectionIndex = courseSectionData.findIndex(
      (sec) => sec._id === sectionId
    )
    const subIndex = courseSectionData[sectionIndex].subSection.findIndex(
      (sub) => sub._id === subSectionId
    )
    return sectionIndex === 0 && subIndex === 0
  }

  const isLastVideo = () => {
    const sectionIndex = courseSectionData.findIndex(
      (sec) => sec._id === sectionId
    )
    const subSections = courseSectionData[sectionIndex].subSection
    const subIndex = subSections.findIndex(
      (sub) => sub._id === subSectionId
    )
    console.log("SUB SECTION DATA 👉", subSections)
    
   setVideoData(subSections)

    return (
      sectionIndex === courseSectionData.length - 1 &&
      subIndex === subSections.length - 1
    )
  }

  const goToNextVideo = () => {
    const sectionIndex = courseSectionData.findIndex(
      (sec) => sec._id === sectionId
    )
    const subSections = courseSectionData[sectionIndex].subSection
    const subIndex = subSections.findIndex(
      (sub) => sub._id === subSectionId
    )

    if (subIndex < subSections.length - 1) {
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${subSections[subIndex + 1]._id}`
      )
    } else {
      const nextSection = courseSectionData[sectionIndex + 1]
      navigate(
        `/view-course/${courseId}/section/${nextSection._id}/sub-section/${nextSection.subSection[0]._id}`
      )
    }
  }

  const goToPrevVideo = () => {
    const sectionIndex = courseSectionData.findIndex(
      (sec) => sec._id === sectionId
    )
    const subSections = courseSectionData[sectionIndex].subSection
    const subIndex = subSections.findIndex(
      (sub) => sub._id === subSectionId
    )

    if (subIndex > 0) {
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${subSections[subIndex - 1]._id}`
      )
    } else {
      const prevSection = courseSectionData[sectionIndex - 1]
      navigate(
        `/view-course/${courseId}/section/${prevSection._id}/sub-section/${prevSection.subSection.at(-1)._id}`
      )
    }
  }

  const handleLectureCompletion = async () => {
    setLoading(true)
    const res = await markLectureAsComplete(
      { courseId, subsectionId: subSectionId },
      token
    )
    if (res) dispatch(updateCompletedLectures(subSectionId))
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-5 text-white">
      {!videoData ? (
        <img
          src={previewSource}
          alt="Preview"
          className="w-full rounded-md object-cover"
        />
      ) : (
        <div className="relative aspect-video rounded-md overflow-hidden">
          {/* <ReactPlayer
            ref={playerRef}
            url={videoData.videoUrl}
            controls
            width="100%"
            height="100%"
            onEnded={() => setVideoEnded(true)}
          /> */}
          {videoData?.videoUrl ? (
          <ReactPlayer
            ref={playerRef}
            url={videoData.videoUrl}
            controls
            width="100%"
            height="100%"
            onEnded={() => setVideoEnded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white">
            Video not available
          </div>
        )}


          {videoEnded && (
            <div className="absolute inset-0 z-10 grid place-content-center bg-black/70">
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={handleLectureCompletion}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl px-4 mx-auto"
                />
              )}

              <IconBtn
                disabled={loading}
                onclick={() => {
                  playerRef.current?.seekTo(0, "seconds")
                  setVideoEnded(false)
                }}
                text="Rewatch"
                customClasses="text-xl px-4 mx-auto mt-2"
              />

              <div className="mt-10 flex gap-4">
                {!isFirstVideo() && (
                  <button onClick={goToPrevVideo} className="blackButton">
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button onClick={goToNextVideo} className="blackButton">
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pb-6">{videoData?.description}</p>
    </div>
  )
}

export default VideoDetails
