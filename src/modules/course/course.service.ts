import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/course.dto';

type CourseRecord = Record<string, any>;

@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Course.name)
        private readonly courseModel: Model<CourseDocument>,
    ) { }

    async getCourses(): Promise<CourseRecord[]> {
        const courses = await this.courseModel.aggregate([
            {
                $lookup: {
                    from: 'lessons',
                    let: { courseId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$courseId', '$$courseId'] },
                            },
                        },
                        {
                            $count: 'count',
                        },
                    ],
                    as: 'lesson_count',
                },
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'industryId',
                    foreignField: '_id',
                    as: 'industry_info',
                },
            },
            {
                $unwind: {
                    path: '$industry_info',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    totalLessons: {
                        $ifNull: [{ $arrayElemAt: ['$lesson_count.count', 0] }, 0],
                    },
                    industryName: '$industry_info.name',
                },
            },
            {
                $project: {
                    lesson_count: 0,
                    industry_info: 0,
                },
            },
        ]);

        return courses.map((course) => this.transformCourse(course));
    }

    async getCourseDetail(slug: string): Promise<CourseRecord> {
        const normalizedSlug = slug.trim().toLowerCase();

        const result = await this.courseModel.aggregate([
            {
                $match: { slug: normalizedSlug },
            },
            {
                $lookup: {
                    from: 'course_modules',
                    let: { courseId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$courseId', '$$courseId'] },
                            },
                        },
                        {
                            $sort: { order: 1 },
                        },
                    ],
                    as: 'modules',
                },
            },
            {
                $lookup: {
                    from: 'lessons',
                    let: { courseId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$courseId', '$$courseId'] },
                            },
                        },
                        {
                            $sort: { order: 1 },
                        },
                    ],
                    as: 'all_lessons',
                },
            },
            {
                $addFields: {
                    totalLessons: { $size: '$all_lessons' },
                    modules: {
                        $map: {
                            input: '$modules',
                            as: 'module',
                            in: {
                                $mergeObjects: [
                                    '$$module',
                                    {
                                        lessons: {
                                            $filter: {
                                                input: '$all_lessons',
                                                as: 'lesson',
                                                cond: { $eq: ['$$lesson.moduleId', '$$module._id'] },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    all_lessons: 0,
                },
            },
        ]);

        if (!result.length) {
            throw new NotFoundException('Course not found');
        }

        return this.transformCourseDetail(result[0]);
    }

    private transformCourse(course: CourseRecord): CourseRecord {
        let fullDesc = (course.description || '').trim();

        fullDesc = fullDesc.replace(/^Giới thiệu khóa học/i, '').trim();

        const splitKey = 'Bạn sẽ học được những gì?';

        let introText = '';
        let learningOutcomes = '';

        if (fullDesc.includes(splitKey)) {
            const parts = fullDesc.split(splitKey);
            introText = parts[0].trim();
            learningOutcomes = parts[1].trim();
        } else {
            introText = fullDesc;
        }

        const shortDescription = `${introText.substring(0, 150).replace(/\n/g, ' ')}...`;

        return {
            ...course,
            introText,
            learningOutcomes,
            shortDescription,
        };
    }

    private transformCourseDetail(course: CourseRecord): CourseRecord {
        const transformedCourse = this.transformCourse(course);

        const modules = Array.isArray(transformedCourse.modules)
            ? [...transformedCourse.modules].map((module) => ({
                ...module,
                lessons: Array.isArray(module.lessons)
                    ? [...module.lessons].sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
                    : [],
            }))
            : [];

        return {
            ...transformedCourse,
            modules,
        };
    }

async create(createCourseDto: CreateCourseDto) {
  const courseData = {
    ...createCourseDto,
    industryId: new Types.ObjectId(createCourseDto.industryId),
  };
  
  const newCourse = new this.courseModel(courseData);
  return newCourse.save();
}
}