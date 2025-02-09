require("dotenv").config({ path: "../.env" });
const axios = require("axios");
const { Skills, Category } = require("../utils/InitializeModels");

// Set up your Hugging Face API key and model
const API_KEY = process.env.NVIDIA_API_KEY; // Replace with your actual API key
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: `${API_KEY}`, // Replace with your OpenAI API key
  baseURL: "https://integrate.api.nvidia.com/v1", // NVIDIA API endpoint
});

async function extractSkills(req, res, next) {
  console.log(req.body);
  const prompt = `
You are an AI trained to extract  skills from text. 
Only list the skills as a comma-separated string. Do not add any explanation.

Text: "${req.body.extractText}"

Skills:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct", // Ensure the model name matches your API
      messages: [{ role: "user", content: prompt }],
      temperature: 0.0, // Deterministic output
      top_p: 1.0, // Consider all relevant tokens
      max_tokens: 100, // Limit to expected token range
    });

    // Extract and return skills from the model's response
    const skills = completion.choices[0]?.message?.content.trim().split(",");

    req.body.skills = skills;
    console.log(skills);
    next();
  } catch (error) {
    console.error("Error extracting skills:", error);
    return null;
  }
}
async function extractSkillsFromPosting(req, res, next) {
  console.log(req.body);
  const prompt = `
You are an AI trained to extract skills required for the job from the job description and job title. 
Only list the skills as a comma-separated string. Do not add any explanation.

Job Description: "${req.body.jobDescription}"

Job Title :"${req.body.jobTitle}"

Skills:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct", // Ensure the model name matches your API
      messages: [{ role: "user", content: prompt }],
      temperature: 0.0, // Deterministic output
      top_p: 1.0, // Consider all relevant tokens
      max_tokens: 100, // Limit to expected token range
    });

    // Extract and return skills from the model's response
    const skills = completion.choices[0]?.message?.content.trim().split(",");

    req.body.skills = skills;
    next();
  } catch (error) {
    console.error("Error extracting skills:", error);
    return null;
  }
}
const findSimilarSkills = async (req, res, next) => {
  const fetchedSkills = req.body.skills;
  const dbSkills = await Skills.findAll({
    attributes: ["skill_name", "skill_id"],
    raw: true,
  });
  console.log("The fetched skills are");
  console.log(fetchedSkills);
  console.log(dbSkills);
  const textSkills = [];
  for (s of dbSkills) {
    textSkills.push(s.skill_name);
  }
  console.log(textSkills);
  const response = await fetch("http://127.0.0.1:5000/extract_skills", {
    method: "POST",
    body: JSON.stringify({
      generated_skills: fetchedSkills,
      db_skills: textSkills,
    }),
    headers: { "Content-type": "application/json" },
  });
  const data = await response.json();

  console.log(data.extracted_skills);
  res.status(200).json({ extracted_skills: data.extracted_skills });
};
const findSimilarCategories = async (req, res, next) => {
  console.log("The most similar skill is ", req.body.most_similar_skill);
  const fetchedSkills = req.body.skills;
  const dbSkills = await Skills.findAll({
    attributes: ["skill_id", "skill_name"],
    raw: true,
  });
  const textCategories = [];
  for (let s of dbSkills) {
    textCategories.push(s.skill_name);
  }
  const response = await fetch("http://127.0.0.1:5000/extract_skills", {
    method: "POST",
    body: JSON.stringify({
      generated_skills: fetchedSkills,
      db_skills: textCategories,
    }),
    headers: { "Content-type": "application/json" },
  });
  const data = await response.json();
  console.log(data);
  const extracted_categories = [];
  for (let s of data.extracted_skills) {
    let c = await Skills.findOne({
      attributes: ["category_id"],
      where: { skill_name: s },
      raw: true,
    });
    console.log(c);

    let catName = await Category.findOne({
      attributes: ["category_name"],
      where: { category_id: c.category_id },
      raw: true,
    });
    if (!extracted_categories.find((c) => c == catName.category_name))
      extracted_categories.push(catName.category_name);
    if (s == data.most_similar_skill) {
      console.log(`I am at most similar skill ${s}`);
      req.body.most_similar_category = catName.category_name;
    }
  }
  if (!req.body.AIGig)
    res.status(200).json({ categories: extracted_categories });
  else {
    req.query.categories = extracted_categories;
    next();
  }
};
const extractGigTitle = async (req, res, next) => {
  const gigDesc = req.body.gigDesc;
  req.body.AIGig = true;
  const prompt = `
You are an AI trained to create concise, professional, and optimized freelancer gig titles. The title should:
- Be between 5 and 20 characters.
- Clearly describe the gig and its value.
- Use keywords that are relevant and engaging to attract clients.
- Avoid filler words or vague terms.

Description: "${gigDesc}"

Craft the most optimized and compelling gig title possible. Return only the title as a string:
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct", // Ensure the model name matches your API
      messages: [{ role: "user", content: prompt }],
      temperature: 0.0, // Deterministic output
      top_p: 1.0, // Consider all relevant tokens
      max_tokens: 100, // Limit to expected token range
    });

    // Extract and return skills from the model's response
    const title = completion.choices[0]?.message?.content.trim();
    req.body.extractText = title;
    console.log(title);
    next();
  } catch (error) {
    console.error("Error extracting skills:", error);
    return null;
  }
};
const extractClientRequirements = async (req, res, next) => {
  const clientText = req.body.clientText;

  if (!clientText) {
    return next(); // Proceed to the next middleware if no client text is provided
  }

  const prompt = `
    You are an AI trained to extract requirements from a client's gig request from a freelancing platform. 
    Please **ONLY** extract the requirements in the following strict JSON format with no additional explanation or text:

    {
      "skills": ["skill1", "skill2"],
      "budget": <budget_value>
    }

    Text: "${clientText}"

    **Provide the output strictly in the format above, with no extra text, explanation, or formatting.**
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct", // Ensure the model name matches your API
      messages: [{ role: "user", content: prompt }],
      temperature: 0.0, // Deterministic output
      top_p: 1.0, // Consider all relevant tokens
      max_tokens: 150, // Increase max_tokens to accommodate both skills and budget
    });

    const responseContent = completion.choices[0]?.message?.content.trim();
    console.log("Raw AI response:", responseContent);

    // Check if the response is in valid JSON format (starts with "{" and ends with "}")
    if (responseContent.startsWith("{") && responseContent.endsWith("}")) {
      try {
        const extractedData = JSON.parse(responseContent);

        // Assign extracted skills and budget to the request body
        req.body.skills = extractedData.skills || [];
        req.body.extracted_budget = extractedData.budget || null;

        console.log("Extracted Skills:", req.body.skills);
        console.log("Extracted Budget:", req.body.extracted_budget);

        return next(); // Proceed to the next middleware
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return res
          .status(400)
          .json({ error: "Invalid JSON format received from AI." });
      }
    } else {
      console.error("Invalid response format:", responseContent);
      return res.status(400).json({
        error: "Invalid format received from AI. Expected strict JSON.",
      });
    }
  } catch (error) {
    console.error("Error extracting requirements:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while extracting requirements." });
  }
};

// API endpoint for generating features
const getFeatures = async (req, res) => {
  console.log("Request body:", req.body);
  const { level, basic_features, title, standard_features } = req.body;

  // Construct the prompt
  const prompt = `
    You are an AI trained to suggest advanced or standard features for a gig based on provided features and level.
    - For generating standard features, use the basic features as input.
    - For generating advanced features, use both standard and basic features as input.
    - Ensure clear demarcation between levels and provide only 3 features as a valid JavaScript array.
    - The output should be a JavaScript array like this: ["feature1", "feature2", "feature3"].
    - Do not include any extra text, explanations, or formatting, only the array.

    Title: "${title}"
    Level: "${level}"
    Basic Features: "${basic_features}"
    Standard Features:"${standard_features}"
  `;

  try {
    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct", // Replace with the appropriate model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.0,
      top_p: 1.0,
      max_tokens: 150, // Adjust token limit as needed
    });

    // Extract the response content
    const responseContent = completion.choices[0]?.message?.content.trim();
    console.log("AI Response:", responseContent);

    // Attempt to parse the response as JSON
    let featuresArray;
    try {
      featuresArray = JSON.parse(responseContent);
      if (!Array.isArray(featuresArray)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Parsing error:", parseError.message);
      return res.status(500).json({
        error: "Invalid response format from AI. Please try again.",
      });
    }

    // Send the validated array to the frontend
    return res.status(200).json({ features: featuresArray });
  } catch (error) {
    console.error("Error generating features:", error.message);
    res
      .status(500)
      .json({ error: "Feature generation failed. Please try again." });
  }
};
const extractCategoriesForTailoredGigs = async (req, res, next) => {
  if (!req.body.skills) next();
  console.log("The most similar skill is ", req.body.most_similar_skill);
  const fetchedSkills = req.body.skills;
  const dbSkills = await Skills.findAll({
    attributes: ["skill_id", "skill_name"],
    raw: true,
  });
  const textCategories = [];
  for (let s of dbSkills) {
    textCategories.push(s.skill_name);
  }
  const response = await fetch("http://127.0.0.1:5000/extract_skills", {
    method: "POST",
    body: JSON.stringify({
      generated_skills: fetchedSkills,
      db_skills: textCategories,
    }),
    headers: { "Content-type": "application/json" },
  });
  const data = await response.json();
  console.log(data);
  const extracted_categories = [];
  for (let s of data.extracted_skills) {
    let c = await Skills.findOne({
      attributes: ["category_id"],
      where: { skill_name: s },
      raw: true,
    });
    console.log(c);
    let catName = await Category.findOne({
      attributes: ["category_name"],
      where: { category_id: c.category_id },
      raw: true,
    });
    if (!extracted_categories.find((c) => c == catName.category_name))
      extracted_categories.push(catName.category_name);
  }
  req.body.extracted_categories = extracted_categories;
  next();
};
const generateTimeLine = async (req, res, next) => {
  const { features, packageFeatures, gigTitle } = req.body;
  const prompt = `
  You are an AI trained to suggest to-do or timeline activities based on the features which are basic features and package features of a gig(if provided), you will be provided with gig title.
  - Return only a JSON array of strings that are to-do tasks only with no other  additional preceeding or succeeding information. 
  features:${features}
  packageFeatures:${packageFeatures}
  title:${gigTitle}
`;

  try {
    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-405b-instruct", // Replace with the appropriate model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.0,
      top_p: 1.0,
      max_tokens: 150, // Adjust token limit as needed
    });

    // Extract the response content
    const responseContent = completion.choices[0]?.message?.content.trim();
    console.log("AI Response:", responseContent);

    // Attempt to parse the response as JSON
    let tasksArray;
    try {
      tasksArray = JSON.parse(responseContent);
      if (!Array.isArray(tasksArray)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Parsing error:", parseError.message);
      return res.status(500).json({
        error: "Invalid response format from AI. Please try again.",
      });
    }

    // Send the validated array to the frontend
    req.body.AIGeneratedTasks = tasksArray;
    next();
  } catch (error) {
    console.error("Error generating features:", error.message);
    res
      .status(500)
      .json({ error: "Feature generation failed. Please try again." });
  }
};
module.exports = {
  extractSkills,
  findSimilarSkills,
  findSimilarCategories,
  extractGigTitle,
  extractClientRequirements,
  getFeatures,
  extractCategoriesForTailoredGigs,
  generateTimeLine,
  extractSkillsFromPosting,
};
// Example usage
