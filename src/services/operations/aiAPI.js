import { toast } from "react-hot-toast"
import { apiConnector } from "../apiconnector"
import { aiEndpoints } from "../api"

const { ASK_DOUBT_API, EXPLAIN_TOPIC_API, GENERATE_QUIZ_API } = aiEndpoints

export const askAIDoubt = async (data, token) => {
  try {
    const response = await apiConnector("POST", ASK_DOUBT_API, data, {
      Authorization: `Bearer ${token}`,
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to ask doubt")
    }

    return response?.data?.reply
  } catch (error) {
    console.error("ASK_AI_DOUBT_API ERROR:", error)
    const errorMsg = error?.response?.data?.error || error?.response?.data?.message || "Failed to get AI answer"
    toast.error(errorMsg)
    return null
  }
}

export const explainAITopic = async (data, token) => {
  const toastId = toast.loading("Generating AI explanation...")
  try {
    const response = await apiConnector("POST", EXPLAIN_TOPIC_API, data, {
      Authorization: `Bearer ${token}`,
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to explain topic")
    }

    toast.dismiss(toastId)
    return response?.data?.explanation
  } catch (error) {
    console.error("EXPLAIN_AI_TOPIC_API ERROR:", error)
    toast.dismiss(toastId)
    const errorMsg = error?.response?.data?.error || error?.response?.data?.message || "Failed to explain topic"
    toast.error(errorMsg)
    return null
  }
}

export const generateAIQuiz = async (data, token) => {
  const toastId = toast.loading("Generating interactive quiz...")
  try {
    const response = await apiConnector("POST", GENERATE_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to generate quiz")
    }

    toast.dismiss(toastId)
    return response?.data?.quiz
  } catch (error) {
    console.error("GENERATE_AI_QUIZ_API ERROR:", error)
    toast.dismiss(toastId)
    const errorMsg = error?.response?.data?.error || error?.response?.data?.message || "Failed to generate quiz"
    toast.error(errorMsg)
    return null
  }
}
