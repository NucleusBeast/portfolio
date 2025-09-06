'use client';

import { useState, useEffect, useRef } from 'react';

interface Skill {
  name: string;
  level: number;
  category: string;
}

export default function Skills() {
  const [isVisible, setIsVisible] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);

  const skills: Skill[] = [
    { name: 'JavaScript', level: 95, category: 'Frontend' },
    { name: 'TypeScript', level: 90, category: 'Frontend' },
    { name: 'React', level: 92, category: 'Frontend' },
    { name: 'Next.js', level: 88, category: 'Frontend' },
    { name: 'Vue.js', level: 85, category: 'Frontend' },
    { name: 'Tailwind CSS', level: 90, category: 'Frontend' },
    { name: 'Node.js', level: 87, category: 'Backend' },
    { name: 'Python', level: 83, category: 'Backend' },
    { name: 'Django', level: 80, category: 'Backend' },
    { name: 'FastAPI', level: 78, category: 'Backend' },
    { name: 'PostgreSQL', level: 85, category: 'Database' },
    { name: 'MongoDB', level: 82, category: 'Database' },
    { name: 'Docker', level: 75, category: 'DevOps' },
    { name: 'AWS', level: 70, category: 'DevOps' },
    { name: 'Git', level: 90, category: 'Tools' },
    { name: 'REST APIs', level: 88, category: 'Backend' },
  ];

  const categories = Array.from(new Set(skills.map(skill => skill.category)));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const ref = skillsRef.current;

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, []);

  const getSkillsByCategory = (category: string) => {
    return skills.filter(skill => skill.category === category);
  };

  return (
    <div ref={skillsRef} className="space-y-8">
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {category}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getSkillsByCategory(category).map((skill, index) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {skill.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {skill.level}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: isVisible ? `${skill.level}%` : '0%',
                      transitionDelay: `${index * 100}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
