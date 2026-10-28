import { courseService } from './courseService';
import { lessonService } from './lessonService';
import { eventService } from './eventService';
import {
  INITIAL_COURSES,
  INITIAL_EVENTS,
  type SeedCourseDef,
} from '@/data/curriculumData';

export { INITIAL_COURSES, INITIAL_EVENTS, type SeedCourseDef };

export async function seedInitialDatabase(): Promise<{ coursesCreated: number; lessonsCreated: number }> {
  let coursesCount = 0;
  let lessonsCount = 0;

  for (const courseDef of INITIAL_COURSES) {
    try {
      const existing = await courseService.getCourseById(courseDef.id);
      if (!existing) {
        await courseService.createCourse(
          {
            title: courseDef.title,
            description: courseDef.description,
            order: courseDef.order,
            published: true,
          },
          courseDef.id
        );
        coursesCount++;

        for (const modDef of courseDef.modules) {
          await courseService.createModule(
            {
              courseId: courseDef.id,
              title: modDef.title,
              order: modDef.order,
              published: true,
            },
            modDef.id
          );

          for (const lesDef of modDef.lessons) {
            await lessonService.createLesson(
              {
                courseId: courseDef.id,
                moduleId: modDef.id,
                title: lesDef.title,
                description: lesDef.description,
                videoProvider: 'youtube',
                videoId: lesDef.videoId,
                notes: lesDef.notes,
                resourceLinks: lesDef.resourceLinks || [],
                order: lesDef.order,
                published: true,
              },
              lesDef.id
            );
            lessonsCount++;
          }
        }
      }
    } catch (e) {
      console.warn(`Could not seed course ${courseDef.id}:`, e);
    }
  }

  // Seed events
  for (const ev of INITIAL_EVENTS) {
    try {
      await eventService.createEvent(ev, ev.id);
    } catch (e) {
      // Ignore if event exists
    }
  }

  return { coursesCreated: coursesCount, lessonsCreated: lessonsCount };
}
