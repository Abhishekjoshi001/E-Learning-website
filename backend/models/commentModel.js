import mongoose from "mongoose";

const commentSchema = new Schema({
    videoId:{
        type:Schema.Types.ObjectId,
        ref:'Video',
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content:{
        type: String,
        trim:true
    },
    timestamp:{
        type:Number,
        default:0
    },
    likes: [
        {
            type:SchemaType.Types.ObjectId,
            ref:'User'
        }
    ],
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    }
},{timestamps:true});

const Comment = model('Comment', commentSchema);

export default Comment;