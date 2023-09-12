"use client";
import React, { FormEvent, useRef, useState } from "react";
const Page = () => {
  const resultText = useRef<HTMLParagraphElement | null>(null);
  const [formField, setFormField] = useState("");
  let controller = new AbortController();
  const generate = async () => {
    const signal = controller.signal;
    try {
      const response = await fetch("/api/hello", {
        method: "GET",
        signal, // Pass the signal to the fetch request
      });
      // Read the response as a stream of data
      const reader = response?.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await (reader as any).read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        (resultText as any).current.innerText += ` ${chunk} `;
      }
    } catch (error) {
      if (signal.aborted) {
        (resultText as any).innerText = "Request aborted.";
      } else {
        console.error("Error:", error);
        (resultText as any).innerText = "Error occurred while generating.";
      }
    } finally {
      (controller as any) = null; // Reset the AbortController instance
    }
  };
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    generate();
  };
  const stop = () => {
    // Abort the fetch request by calling abort() on the AbortController instance
    if (controller) {
      controller.abort();
      (controller as any) = null;
    }
  };

  return (
    <div className="w-full justify-center items-center p-4 md:p-10 flex flex-col">
      <form
        onSubmit={handleFormSubmit}
        className="md:max-w-2xl p-8 rounded-md bg-gray-100"
      >
        <h1 className="text-3xl font-bold mb-6">
          Streaming OpenAI API Completions in JavaScript
        </h1>
        <div id="resultContainer" className="mt-4 h-48 overflow-y-auto">
          <p className="text-gray-500 text-sm mb-2">Generated Text</p>
          <p id="resultText" ref={resultText} className="whitespace-pre-line" />
        </div>
        <input
          type="text"
          id="promptInput"
          value={formField}
          onChange={(e) => {
            setFormField(e.target.value);
          }}
          className="w-full px-4 py-2 rounded-md bg-gray-200 placeholder-gray-500 focus:outline-none mt-4"
          placeholder="Enter prompt..."
        />
        <div className="flex justify-center mt-4">
          <button
            id="generateBtn"
            className="w-1/2 px-4 py-2 rounded-md bg-black text-white hover:bg-gray-900 focus:outline-none mr-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            Generate
          </button>
          <button
            id="stopBtn"
            onClick={stop}
            className="w-1/2 px-4 py-2 rounded-md border border-gray-500 text-gray-500 hover:text-gray-700 hover:border-gray-700 focus:outline-none ml-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            Stop
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
