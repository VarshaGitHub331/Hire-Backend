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
  req.body.extracted_skills = data.extracted_skills;

  next();
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
module.exports = {
  extractSkills,
  findSimilarSkills,
  findSimilarCategories,
  extractGigTitle,
};
// Example usage
