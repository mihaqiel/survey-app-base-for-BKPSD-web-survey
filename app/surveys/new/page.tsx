"use client";
import { useState } from "react";
import { createDynamicSurvey } from "@/app/action/admin";

export default function NewSurveyPage() {
  const [questions, setQuestions] = useState([{ text: "", type: "TEXT" }]);

  const addQuestion = () =>
    setQuestions([...questions, { text: "", type: "TEXT" }]);
  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-10 text-white max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Assessment</h1>

      <form action={createDynamicSurvey} className="space-y-6">
        <div className="space-y-4">
          {/* Assessment Title */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Assessment Title</label>
            <input
              name="title"
              className="w-full p-3 bg-gray-900 border border-gray-800 rounded outline-none focus:border-blue-500"
              placeholder="e.g., Regional Performance Review"
              required
            />
          </div>

          {/* UPDATED: Deadline Input with Time Support */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Set Deadline & Hour (Optional)</label>
            <input
              type="datetime-local" // Changed from 'date' to 'datetime-local'
              name="deadline"
              className="w-full p-3 bg-gray-900 border border-gray-800 rounded outline-none focus:border-blue-500 text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div
              key={i}
              className="flex gap-4 items-start p-4 bg-gray-900 border border-gray-800 rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <input
                  name="qText"
                  placeholder={`Question #${i + 1}`}
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                  required
                />
                <select
                  name="qType"
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-blue-400 font-bold"
                >
                  <option value="TEXT">Text Explanation</option>
                  <option value="SCORE">Rating Scale (1-4)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="text-red-500 hover:text-red-400 p-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addQuestion}
            className="flex-1 border border-gray-700 p-3 rounded-lg hover:bg-gray-800 transition"
          >
            + Add Question
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 p-3 rounded-lg font-bold hover:bg-blue-500 transition"
          >
            Publish to Regions
          </button>
        </div>
      </form>
    </div>
  );
}