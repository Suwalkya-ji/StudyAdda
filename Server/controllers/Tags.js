const Tag = require('../models/Tags');

// handler function for create a tag
exports.createTag = async(req,res) => {
    try{
        // fetch data
        const {name, description} = req.body;

        // validation
        if(!name || !description) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }

        // create entry in DB
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        // return response
        return res.status(200).json({
            success:true,
            message:"Tag Created Successfully",
        })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};


// handler function for get all tags

exports.showAllTags = async (req,res) => {
    try{
            const allTags = await Tag.find({}, {name:true, description:true});
            res.status(200).json({
                success:true,
                message:'All Tags returned successfully',
                allTags,
            })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}