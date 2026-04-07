import { Expose, Transform } from "class-transformer";

export class UserResponseDto {
    @Expose()
    @Transform(({ value, obj }) => {
        return value?.toString() || obj.id?.toString() || obj._id?.toString();
    })
    id: string;

    @Expose()
    role: string;

    @Expose()
    firstName?: string;

    @Expose()
    lastName?: string;

    @Expose()
    identifiedID?: string;

    @Expose()
    gender?: string;

    @Expose()
    dob?: string;

    @Expose()
    phone?: string;

    @Expose()
    email: string;

    @Expose()
    createdAt: Date;

}