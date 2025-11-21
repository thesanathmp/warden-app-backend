import Photo from "../models/Photo.js";

export const addRemark = async (req, res) => {
  const { photoId, text, status } = req.body;

  await Photo.findByIdAndUpdate(photoId, {
    $push: {
      remarks: {
        officerId: req.user.id,
        text,
        status,
      },
    },
  });

  res.json({ success: true });
};
