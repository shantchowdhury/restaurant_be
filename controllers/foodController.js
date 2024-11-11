import foodModel from "../models/foodModel.js";
import fs from 'fs';

// Add food item
const addFood = async (req, res) => {
  try {
    // Check if the image file is available
    if (!req.file || !req.file.filename) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    // Prepare image filename from the uploaded file
    let image_filename = `${req.file.filename}`; // Use backticks for template literals

    // Create a new food item with the provided data
    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: image_filename,
    });

    // Save the food item to the database
    await food.save();
    res.status(201).json({ success: true, message: "Food Added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding food" });
  }
};
//all food list
const listFood = async (req,res) => {
try {
  const foods = await foodModel.find({});
  res.json({success:true,data:foods})
} catch (error) {
  console.log(error);
  res.json({success:false,message:"Error"})
}
}
//remove food item

const removeFood = async (req,res) =>{
  try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`,()=>{})

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({success:true,message:"Food Removed"})

  }
  catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
  }


}





export { addFood,listFood,removeFood };
