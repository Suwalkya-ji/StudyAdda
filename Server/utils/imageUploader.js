const cloudinary = require('cloudinary').v2



exports.uploadImageToCloudinary = async(file, folder, height, quality ) => {
    const options = {folder};

    if(height) {
        options.height = height;
    }

    if(quality){
        options.quality = quality;
    }

    options.resource_type = "image";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}


// 🔹 Video Upload
exports.uploadVideoToCloudinary = async (file, folder) => {
  const options = {
    folder,
    resource_type: "video", // 🔥 REQUIRED
  };

  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
