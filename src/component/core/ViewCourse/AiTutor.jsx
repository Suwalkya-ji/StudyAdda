import React, { useState } from "react"
import { useSelector } from "react-redux"
import ReactMarkdown from "react-markdown"
import { FiMessageSquare, FiBookOpen, FiHelpCircle, FiSend, FiRefreshCw, FiCheckCircle, FiXCircle } from "react-icons/fi"
import { askAIDoubt, explainAITopic, generateAIQuiz } from "../../../services/operations/aiAPI"

const AiTutor = ({ topicTitle, topicDescription, courseTitle }) => {
  const { token } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState("doubt") // "doubt" | "explain" | "quiz"

  // 1. Doubt Chat State
  const [question, setQuestion] = useState("")
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "ai",
      text: `Hello! I'm your **StudyAdda AI Tutor** 🤖.\n\nAsk me any doubt about **${topicTitle || "this topic"}**!`,
    },
  ])
  const [askingDoubt, setAskingDoubt] = useState(false)

  // 2. Explanation State
  const [explanation, setExplanation] = useState("")
  const [loadingExplain, setLoadingExplain] = useState(false)

  // 3. Quiz State
  const [quiz, setQuiz] = useState(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  // --- Handlers ---
  const handleAskDoubt = async (e) => {
    e?.preventDefault()
    if (!question.trim()) return

    const userMsg = { sender: "user", text: question }
    setChatHistory((prev) => [...prev, userMsg])
    const currentQ = question
    setQuestion("")
    setAskingDoubt(true)

    const reply = await askAIDoubt(
      {
        question: currentQ,
        topicTitle,
        topicDescription,
        courseTitle,
        chatHistory,
      },
      token
    )

    setAskingDoubt(false)
    if (reply) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: reply }])
    }
  }

  const handleGenerateExplanation = async () => {
    setLoadingExplain(true)
    const res = await explainAITopic(
      { topicTitle, topicDescription, courseTitle },
      token
    )
    setLoadingExplain(false)
    if (res) setExplanation(res)
  }

  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true)
    const res = await generateAIQuiz(
      { topicTitle, topicDescription, courseTitle, count: 5 },
      token
    )
    setLoadingQuiz(false)
    if (res && res.length > 0) {
      setQuiz(res)
      setCurrentQuestionIndex(0)
      setSelectedOption(null)
      setScore(0)
      setQuizFinished(false)
    }
  }

  const handleOptionSelect = (optionIndex) => {
    if (selectedOption !== null) return // Already answered
    setSelectedOption(optionIndex)

    const currentQ = quiz[currentQuestionIndex]
    if (optionIndex === currentQ.correctIndex) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
    } else {
      setQuizFinished(true)
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-richblack-700 bg-richblack-800 p-4 sm:p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-richblack-700 pb-4 gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-yellow-50">
            🤖 StudyAdda AI Tutor
          </h2>
          <p className="text-xs text-richblack-300 mt-1">
            Topic: <span className="text-richblack-100 font-medium">{topicTitle || "Current Lecture"}</span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 rounded-lg bg-richblack-900 p-1 border border-richblack-700 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab("doubt")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "doubt"
                ? "bg-yellow-50 text-richblack-900 font-semibold"
                : "text-richblack-200 hover:text-white"
            }`}
          >
            <FiMessageSquare /> Ask Doubt
          </button>
          <button
            onClick={() => {
              setActiveTab("explain")
              if (!explanation && !loadingExplain) handleGenerateExplanation()
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "explain"
                ? "bg-yellow-50 text-richblack-900 font-semibold"
                : "text-richblack-200 hover:text-white"
            }`}
          >
            <FiBookOpen /> Explain Topic
          </button>
          <button
            onClick={() => {
              setActiveTab("quiz")
              if (!quiz && !loadingQuiz) handleGenerateQuiz()
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "quiz"
                ? "bg-yellow-50 text-richblack-900 font-semibold"
                : "text-richblack-200 hover:text-white"
            }`}
          >
            <FiHelpCircle /> Practice Quiz
          </button>
        </div>
      </div>

      {/* TAB 1: ASK DOUBT */}
      {activeTab === "doubt" && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="max-h-[350px] min-h-[220px] overflow-y-auto flex flex-col gap-3 rounded-lg bg-richblack-900 p-4 border border-richblack-700 text-sm">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    msg.sender === "user" ? "bg-yellow-50 text-richblack-900" : "bg-richblack-700 text-yellow-50"
                  }`}
                >
                  {msg.sender === "user" ? "You" : "AI"}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 leading-relaxed text-xs sm:text-sm ${
                    msg.sender === "user"
                      ? "bg-yellow-50 text-richblack-900 font-medium"
                      : "bg-richblack-700 text-richblack-50"
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {askingDoubt && (
              <div className="flex gap-2 items-center text-xs text-yellow-100 italic animate-pulse">
                <span>AI Tutor is thinking...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleAskDoubt} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask any doubt about this video/topic..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 rounded-lg bg-richblack-900 px-4 py-2.5 text-sm text-white border border-richblack-700 focus:outline-none focus:border-yellow-50"
            />
            <button
              type="submit"
              disabled={askingDoubt || !question.trim()}
              className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-richblack-900 hover:scale-95 transition-all disabled:opacity-50"
            >
              <FiSend /> Send
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: EXPLAIN TOPIC */}
      {activeTab === "explain" && (
        <div className="mt-4 flex flex-col gap-4">
          {loadingExplain ? (
            <div className="flex py-12 flex-col items-center justify-center gap-3 text-yellow-100">
              <FiRefreshCw className="animate-spin text-3xl" />
              <p className="text-sm font-medium">Generating comprehensive breakdown & examples...</p>
            </div>
          ) : explanation ? (
            <div className="rounded-lg bg-richblack-900 p-5 border border-richblack-700 leading-relaxed text-sm prose prose-invert max-w-none">
              <ReactMarkdown>{explanation}</ReactMarkdown>
              <button
                onClick={handleGenerateExplanation}
                className="mt-4 flex items-center gap-2 rounded-md border border-richblack-600 bg-richblack-800 px-3 py-1.5 text-xs text-richblack-200 hover:text-white"
              >
                <FiRefreshCw /> Regenerate Explanation
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateExplanation}
              className="mx-auto my-8 flex items-center gap-2 rounded-lg bg-yellow-50 px-6 py-2.5 text-sm font-semibold text-richblack-900"
            >
              <FiBookOpen /> Generate Topic Explanation
            </button>
          )}
        </div>
      )}

      {/* TAB 3: PRACTICE QUIZ */}
      {activeTab === "quiz" && (
        <div className="mt-4 flex flex-col gap-4">
          {loadingQuiz ? (
            <div className="flex py-12 flex-col items-center justify-center gap-3 text-yellow-100">
              <FiRefreshCw className="animate-spin text-3xl" />
              <p className="text-sm font-medium">Creating 5 topic-focused quiz questions...</p>
            </div>
          ) : quizFinished ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8 rounded-lg bg-richblack-900 border border-richblack-700 text-center">
              <div className="text-5xl">🏆</div>
              <h3 className="text-2xl font-bold text-yellow-50">Quiz Completed!</h3>
              <p className="text-lg text-richblack-200">
                You scored <span className="font-bold text-yellow-50">{score}</span> out of{" "}
                <span className="font-bold text-white">{quiz.length}</span>
              </p>
              <button
                onClick={handleGenerateQuiz}
                className="mt-2 flex items-center gap-2 rounded-lg bg-yellow-50 px-5 py-2 text-sm font-semibold text-richblack-900 hover:scale-95 transition-all"
              >
                <FiRefreshCw /> Take New Quiz
              </button>
            </div>
          ) : quiz && quiz.length > 0 ? (
            <div className="rounded-lg bg-richblack-900 p-5 border border-richblack-700">
              {/* Quiz Header Progress */}
              <div className="flex justify-between items-center text-xs text-richblack-300 pb-3 border-b border-richblack-800">
                <span>Question {currentQuestionIndex + 1} of {quiz.length}</span>
                <span>Score: {score}</span>
              </div>

              {/* Question Text */}
              <h3 className="mt-4 text-base font-semibold text-white">
                {quiz[currentQuestionIndex].question}
              </h3>

              {/* Options */}
              <div className="mt-4 flex flex-col gap-2.5">
                {quiz[currentQuestionIndex].options.map((optionText, optIdx) => {
                  const isSelected = selectedOption === optIdx
                  const isCorrect = optIdx === quiz[currentQuestionIndex].correctIndex
                  let optionStyle = "border-richblack-700 bg-richblack-800 hover:bg-richblack-700 text-richblack-100"

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      optionStyle = "border-caribbeangreen-200 bg-caribbeangreen-900/30 text-caribbeangreen-100 font-semibold"
                    } else if (isSelected) {
                      optionStyle = "border-pink-300 bg-pink-900/30 text-pink-100 font-semibold"
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={selectedOption !== null}
                      onClick={() => handleOptionSelect(optIdx)}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-all ${optionStyle}`}
                    >
                      <span>{optionText}</span>
                      {selectedOption !== null && isCorrect && <FiCheckCircle className="text-caribbeangreen-200 text-lg" />}
                      {selectedOption !== null && isSelected && !isCorrect && <FiXCircle className="text-pink-300 text-lg" />}
                    </button>
                  )
                })}
              </div>

              {/* Explanation after answering */}
              {selectedOption !== null && (
                <div className="mt-4 rounded-lg bg-richblack-800 p-4 border border-richblack-700 text-xs sm:text-sm">
                  <p className="font-semibold text-yellow-50">Explanation:</p>
                  <p className="mt-1 text-richblack-200">{quiz[currentQuestionIndex].explanation}</p>
                  <button
                    onClick={handleNextQuestion}
                    className="mt-4 ml-auto block rounded-md bg-yellow-50 px-4 py-2 text-xs font-semibold text-richblack-900 hover:scale-95 transition-all"
                  >
                    {currentQuestionIndex < quiz.length - 1 ? "Next Question ➔" : "View Results"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleGenerateQuiz}
              className="mx-auto my-8 flex items-center gap-2 rounded-lg bg-yellow-50 px-6 py-2.5 text-sm font-semibold text-richblack-900"
            >
              <FiHelpCircle /> Start Interactive Quiz
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AiTutor
