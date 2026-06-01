 import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"
 export const getCurrentUser=async (req,res)=>{
    try {
        const userId=req.userId
        const user=await User.findById(userId).select("-password")
        if(!user){
return res.status(400).json({message:"user not found"})
        }

   return res.status(200).json(user)     
    } catch (error) {
       return res.status(400).json({message:"get current user error"}) 
    }
}

export const updateAssistant=async (req,res)=>{
   try {
      const {assistantName,imageUrl}=req.body
      let assistantImage;
if(req.file){
   assistantImage=await uploadOnCloudinary(req.file.path)
}else{
   assistantImage=imageUrl
}

const user=await User.findByIdAndUpdate(req.userId,{
   assistantName,assistantImage
},{new:true}).select("-password")
return res.status(200).json(user)

      
   } catch (error) {
       return res.status(400).json({message:"updateAssistantError user error"}) 
   }
}


export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    console.log("Command received:", command);

    if (!command) {
        return res.status(400).json({ response: "Command is missing" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
        return res.status(404).json({ response: "User not found" });
    }

    // Save history (await it)
    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName || "Jarvis";
    
    // Get response from AI
    let gemResult;
    try {
        const resultString = await geminiResponse(command, assistantName, userName);
        gemResult = JSON.parse(resultString);
        
        // ROBUSTNESS: If AI put the actual intent inside data.intent or data.type
        if (gemResult.type === "intent" || !gemResult.type) {
            gemResult.type = gemResult.data?.intent || gemResult.data?.type || "general-chat";
        }
    } catch (error) {
        console.error("AI Response/Parse Error:", error);
        gemResult = null;
    }

    // LOCAL FALLBACK SYSTEM
    if (!gemResult) {
        const cmd = command.toLowerCase();
        let fallbackResponse = "I am having trouble connecting to my brain. Please check the API key.";
        let fallbackType = "general-chat";

        if (cmd.includes("who created you") || cmd.includes("who made you")) {
            fallbackResponse = "Chetan created me.";
        } else if (cmd.includes("open youtube")) {
            fallbackType = "youtube-open";
            fallbackResponse = "Opening YouTube.";
        } else if (cmd.includes("open instagram")) {
            fallbackType = "instagram-open";
            fallbackResponse = "Opening Instagram.";
        }

        gemResult = {
            type: fallbackType,
            userInput: command,
            response: fallbackResponse,
            verbosity: "normal",
            data: {}
        };
    }

    // HANDLE SERVER-SIDE GENERATED CONTENT (TIME, DATE, etc.)
    if (gemResult.type === "get-time") {
        gemResult.response = `Current time is ${moment().format("hh:mm A")}`;
    } else if (gemResult.type === "get-date") {
        gemResult.response = `Current date is ${moment().format("YYYY-MM-DD")}`;
    } else if (gemResult.type === "get-day") {
        gemResult.response = `Today is ${moment().format("dddd")}`;
    } else if (gemResult.type === "get-month") {
        gemResult.response = `The current month is ${moment().format("MMMM")}`;
    }

    // RETURN FINAL JSON TO FRONTEND
    return res.json(gemResult);

  } catch (error) {
    console.error("AskToAssistant Controller Error:", error);
    return res.status(500).json({
      type: "general",
      userInput: "",
      response: "Internal server error in processing your request."
    });
  }
};