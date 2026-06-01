import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  
  const isSpeakingRef = useRef(false);
  const isListeningRef = useRef(false);
  const recognitionRef = useRef(null);
  const retryCountRef = useRef(0);
  const restartTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      synth.cancel();
    };
  }, []);
  
  const [ham, setHam] = useState(false);
  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognitionSafely = () => {
    if (isSpeakingRef.current || isListeningRef.current) return;

    if (retryCountRef.current >= 3) {
        console.warn("MAX_RETRIES reached. Stopping auto-restart.");
        return;
    }

    try {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        
        restartTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && !isSpeakingRef.current && !isListeningRef.current) {
                try {
                    recognitionRef.current?.start();
                } catch (e) {
                    if (e.name !== "InvalidStateError") console.error("Start Error:", e);
                }
            }
        }, 1000); 
    } catch (error) {
        console.error("Safe Start Error:", error);
    }
  };

  const speak = (text) => {
    if (!text) return;
    
    console.log("Speaking:", text);

    // Cancel previous speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = synth.getVoices();
    const googleVoice = voices.find((v) => v.name.includes("Google US English") || v.name.includes("Male"));
    if (googleVoice) utterance.voice = googleVoice;

    utterance.onstart = () => {
        isSpeakingRef.current = true;
        // Ensure recognition is stopped while speaking
        try {
            recognitionRef.current?.stop();
            isListeningRef.current = false;
        } catch (e) {}
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setTimeout(() => {
        if (isMountedRef.current) {
            startRecognitionSafely();
        }
      }, 500);
    };

    utterance.onerror = (err) => {
        console.error("TTS Error:", err);
        isSpeakingRef.current = false;
        startRecognitionSafely();
    };

    synth.speak(utterance);
    setAiText(text);
  };

  const handleCommand = (dataObj) => {
    if (!dataObj) return;

    const { type, userInput, response, data } = dataObj;
    
    // Speak response FIRST
    speak(response);

    // Extraction logic for queries from the new "data" field
    const query = encodeURIComponent(data?.query || data?.city || userInput || "");

    switch (type) {
        case "chatgpt-open":
            const chatgptWin = window.open("https://chatgpt.com", "_blank");
            if (!chatgptWin) alert("Pop-up blocked! Please allow pop-ups for this site to open ChatGPT.");
            break;
        case "instagram-open":
            const instaWin = window.open("https://instagram.com", "_blank");
            if (!instaWin) alert("Pop-up blocked! Please allow pop-ups for this site to open Instagram.");
            break;
        case "github-open":
            const githubWin = window.open("https://github.com", "_blank");
            if (!githubWin) alert("Pop-up blocked! Please allow pop-ups for this site to open GitHub.");
            break;
        case "facebook-open":
            const fbWin = window.open("https://facebook.com", "_blank");
            if (!fbWin) alert("Pop-up blocked! Please allow pop-ups for this site to open Facebook.");
            break;
        case "linkedin-open":
            const liWin = window.open("https://linkedin.com", "_blank");
            if (!liWin) alert("Pop-up blocked! Please allow pop-ups for this site to open LinkedIn.");
            break;
        case "twitter-open":
            const twWin = window.open("https://twitter.com", "_blank");
            if (!twWin) alert("Pop-up blocked! Please allow pop-ups for this site to open Twitter.");
            break;
        case "amazon-open":
            const amzWin = window.open("https://amazon.com", "_blank");
            if (!amzWin) alert("Pop-up blocked! Please allow pop-ups for this site to open Amazon.");
            break;
        case "flipkart-open":
            const fkWin = window.open("https://flipkart.com", "_blank");
            if (!fkWin) alert("Pop-up blocked! Please allow pop-ups for this site to open Flipkart.");
            break;
        case "gmail-open":
            const mailWin = window.open("https://mail.google.com", "_blank");
            if (!mailWin) alert("Pop-up blocked! Please allow pop-ups for this site to open Gmail.");
            break;
        case "whatsapp-open":
            const waWin = window.open("https://web.whatsapp.com", "_blank");
            if (!waWin) alert("Pop-up blocked! Please allow pop-ups for this site to open WhatsApp.");
            break;
        case "spotify-open":
            const spotWin = window.open("https://spotify.com", "_blank");
            if (!spotWin) alert("Pop-up blocked! Please allow pop-ups for this site to open Spotify.");
            break;
        case "netflix-open":
            const netWin = window.open("https://netflix.com", "_blank");
            if (!netWin) alert("Pop-up blocked! Please allow pop-ups for this site to open Netflix.");
            break;
        case "youtube-open":
            const ytWin = window.open("https://youtube.com", "_blank");
            if (!ytWin) alert("Pop-up blocked! Please allow pop-ups for this site to open YouTube.");
            break;
        case "calculator-open":
            window.open("https://www.google.com/search?q=calculator", "_blank");
            break;
        case "notepad-open":
            window.open("https://www.google.com/search?q=online+notepad", "_blank");
            break;
        case "google-search":
            window.open(`https://www.google.com/search?q=${query}`, "_blank");
            break;
        case "youtube-search":
        case "youtube-play":
            window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank");
            break;
        case "github-search":
            window.open(`https://github.com/search?q=${query}`, "_blank");
            break;
        case "wikipedia-search":
            window.open(`https://en.wikipedia.org/wiki/${query}`, "_blank");
            break;
        case "news-search":
            window.open(`https://news.google.com/search?q=${query}`, "_blank");
            break;
        case "image-search":
            window.open(`https://www.google.com/search?q=${query}&tbm=isch`, "_blank");
            break;
        case "weather-show":
            window.open(`https://www.google.com/search?q=weather+in+${query}`, "_blank");
            break;
        case "url-open":
            let targetUrl = data?.url || userInput;
            if (targetUrl) {
                if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;
                window.open(targetUrl, "_blank");
            }
            break;
        case "vscode-open":
            window.open("vscode://", "_blank");
            break;
        case "terminal-open":
            speak("I cannot open the terminal directly from the browser for security reasons, but I can help you with commands.");
            break;
        case "get-time":
        case "get-date":
        case "get-day":
        case "get-month":
        case "general-chat":
        case "general":
        case "calculate":
        case "currency-convert":
        case "unit-convert":
        case "note-create":
        case "todo-add":
        case "todo-show":
        case "reminder-set":
        case "alarm-set":
        case "timer-set":
        case "generate-code":
        case "explain-code":
        case "fix-code":
        case "camera-open":
        case "camera-close":
        case "qr-scan":
        case "assistant-sleep":
        case "assistant-wake":
        case "conversation-end":
            // These intents are primarily handled by the spoken 'response'
            console.log("Intent handled via speech:", type);
            break;
        default:
            console.log("Unknown or generic intent:", type);
    }

    // Help user debug pop-up blockers
    console.log("Attempted to open window. If nothing happened, please allow pop-ups for this site.");
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error("Speech recognition not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log("Recognition started");
      isListeningRef.current = true;
      setListening(true);
      retryCountRef.current = 0; // Reset on success
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      isListeningRef.current = false;
      setListening(false);
      
      // Auto-restart if still mounted and not speaking
      if (isMountedRef.current && !isSpeakingRef.current) {
        startRecognitionSafely();
      }
    };

    recognition.onerror = (e) => {
      console.log("Recognition error:", e.error);
      isListeningRef.current = false;
      setListening(false);

      if (e.error === "no-speech") {
        retryCountRef.current++;
        startRecognitionSafely();
      } else if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) {
        console.error("Critical Recognition Error:", e.error);
        retryCountRef.current = 99; // Force stop auto-restart
      } else {
        startRecognitionSafely();
      }
    };

    recognition.onresult = async (e) => {
      let transcript = e.results[e.results.length - 1][0].transcript.trim().toLowerCase();
      transcript = transcript.replace(/\s+/g, " "); // Remove extra spaces
      console.log("Recognized:", transcript);

      const assistantName = userData?.assistantName?.toLowerCase() || "jarvis";
      // Wake word detection: Jarvis or Custom Name, or if already in an active listening state
      const isWakeWord = transcript.includes(assistantName) || transcript.includes("jarvis");
      
      if (isWakeWord || listening) {
        setUserText(transcript);
        setLoading(true);
        
        // Stop recognition to avoid feedback
        try {
            recognition.stop();
        } catch (e) {}
        isListeningRef.current = false;
        setListening(false);

        const command = transcript.toLowerCase().trim();
        console.log("Processing command logic for:", command);

        // AI-DRIVEN INTENT DETECTION (Removed redundant local matches)
        try {
            const data = await getGeminiResponse(transcript);
            console.log("AI Intent Data:", data);
            handleCommand(data);
            setAiText(data?.response || "");
        } catch (err) {
            console.error("Error processing command:", err);
            speak("I am sorry, I encountered an error processing your command.");
        } finally {
            setLoading(false);
            setUserText("");
        }
      }
    };

    // Initial Start
    const initialStartTimeout = setTimeout(() => {
        if (isMountedRef.current) startRecognitionSafely();
    }, 1500);

    // Initial Greeting
    if (userData?.name) {
        speak(`Welcome back ${userData.name}. How can I assist you today?`);
    }

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      clearTimeout(initialStartTimeout);
      try {
          recognition.stop();
      } catch (e) {}
      synth.cancel();
    };
  }, [userData?.assistantName, userData?.name]);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden">
      <CgMenuRight
        className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
        onClick={() => setHam(true)}
      />
      <div
        className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${
          ham ? "translate-x-0" : "translate-x-full"
        } transition-transform`}
      >
        <RxCross1
          className=" text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
          onClick={() => setHam(false)}
        />
        <button
          className="min-w-[150px] h-[60px]  text-black font-semibold   bg-white rounded-full cursor-pointer text-[19px] "
          onClick={handleLogOut}
        >
          Log Out
        </button>
        <button
          className="min-w-[150px] h-[60px]  text-black font-semibold  bg-white  rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] "
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>
        <h1 className="text-white font-semibold text-[19px]">History</h1>

        <div className="w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate">
          {userData.history?.map((his, index) => (
            <div
              key={index}
              className="text-gray-200 text-[18px] w-full h-[30px]"
            >
              {his}
            </div>
          ))}
        </div>
      </div>
      <button
        className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px]  bg-white rounded-full cursor-pointer text-[19px] "
        onClick={handleLogOut}
      >
        Log Out
      </button>
      <button
        className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block "
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>
      <div 
        className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg cursor-pointer"
        onClick={() => {
            retryCountRef.current = 0; // Reset retries on manual click
            startRecognitionSafely();
            speak("I am listening.");
        }}
      >
        <img
          src={userData?.assistantImage}
          alt=""
          className="h-full object-cover"
        />
      </div>
      <h1 className="text-white text-[18px] font-semibold">
        {listening ? "Listening..." : "I'm " + (userData?.assistantName || "Jarvis")}
      </h1>
      {!aiText && !loading && <img src={userImg} alt="" className="w-[200px]" />}
      {(aiText || loading) && <img src={aiImg} alt="" className="w-[200px]" />}

      <h1 className="text-white text-[18px] font-semibold text-wrap text-center px-[20px]">
        {loading ? "Processing..." : userText ? userText : aiText ? aiText : "Ready for commands..."}
      </h1>
    </div>
  );
}

export default Home;
