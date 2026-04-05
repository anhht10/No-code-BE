import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostCategoryDocument = HydratedDocument<PostCategory>;

@Schema({
    timestamps: true,
    collection: 'post_category',
    toObject: {
        virtuals: true,
        getters: true,
    },
})
export class PostCategory {
    @Prop({ type: String, required: true, trim: true, maxlength: 100 })
    title: string;

    @Prop({
        type: String,
        required: true,
    })
    slug: string;

}

export const PostCategorySchema = SchemaFactory.createForClass(PostCategory);