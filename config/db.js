import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://shantochw:DrowssaP64@cluster0.9agka.mongodb.net/CuisineFest').then(()=>console.log("DB Connected "));
}