const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

/* =========================
   IMAGE UPLOAD (STREAM)
========================= */
exports.uploadImageToCloudinary = (file, folder, height, quality) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: "image",
    };

    if (height) options.height = height;
    if (quality) options.quality = quality;

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(file.data).pipe(uploadStream);
  });
};

/* =========================
   VIDEO UPLOAD (STREAM)
========================= */
exports.uploadVideoToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: "video",
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(file.data).pipe(uploadStream);
  });
};
