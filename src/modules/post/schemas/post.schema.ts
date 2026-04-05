import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({
    timestamps: true,
    toObject: {
        virtuals: true,
        getters: true,
    },
})
export class Post {
    @Prop({ type: String, required: true, trim: true, maxlength: 200 })
    title: string;

    @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
    slug: string;

    @Prop({ type: String, default: '' })
    content: string;

    @Prop({ type: String, trim: true, maxlength: 500 })
    excerpt: string;

    @Prop({ type: String })
    thumbnail: string;

    @Prop({
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true,
    })
    status: string;

    @Prop({ type: Types.ObjectId, ref: 'PostCategory', required: true, index: true })
    categoryId: Types.ObjectId;

}

export const PostSchema = SchemaFactory.createForClass(Post);