import "./View_equiv.css";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function View_equiv() {
  const { experienceId } = useParams();
     const [equivalencies, setEquivalencies] = useState([]);
     const [learningExperience, setLearningExperience] = useState(null);
     const [courses, setCourses] = useState({});
   const [loading, setLoading] = useState(() => Boolean(experienceId));
      const [error, setError] = useState(null);
      const missingExperienceId = !experienceId;

      useEffect(() => {
        let mounted = true;
        if (!experienceId) {
          return;
        }

        fetch(`/api/learning-experiences/${experienceId}`)
            .then((res) => {
              if (!res.ok) throw new Error("Network response was not ok");
              return res.json();
            })
            .then((data) => {
              if (mounted) {
                setLearningExperience(data);
                console.log("Fetched learning experience data:", data);
                setLoading(false);
              }
            })
            .catch((error) => {
              if (mounted) {
                setError(error.message);
                setLoading(false);
              }
            });

        fetch(`/api/matches/equivalency/${experienceId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
          }
        )
          .then((data1) => {
            if (mounted) {
              setEquivalencies(data1);
              console.log("Fetched equivalencies data:", data1);
              setLoading(false);
            }
          })
          .catch((error) => {
            if (mounted) {
              setError(error.message);
              setLoading(false);
            }
          });

        return () => {
          mounted = false;
        };
      }, [experienceId]);

     useEffect(() => {
  if (equivalencies.length === 0) return;

  Promise.all(
    equivalencies.map((eq) =>
      fetch(`/api/cuny-courses/${eq.course_id}`)
        .then((res) => res.json())
        .then((course) => ({ [eq.course_id]: course }))
    )
  )
    .then((courseArray) => {
      // Merge all courses into a lookup object
      const courseMap = Object.assign({}, ...courseArray);
      setCourses(courseMap);
    })
    .catch((error) => console.error("Error fetching courses:", error));
}, [equivalencies]); 

console.log("equivalencies:", equivalencies);
console.log("courses:", courses);

    if (missingExperienceId) {
      return (
        <div>
          <h1>Missing experience id</h1>
          <p>Please open this page from a learning experience.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div>
          <h1>Loading equivalencies...</h1>
          <p>Please wait while the learning experience and course data load.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div>
          <h1>Unable to load equivalencies</h1>
          <p>{error}</p>
        </div>
      );
    }

    return (
        <div>
            <h1>{learningExperience?.title } Equivalencies</h1>

            <p>This page will list the CUNY courses that have been marked as equivalent to the learning experience.</p>
       {equivalencies.map((eq) => {
  const course = courses[eq.course_id];
  if (!course) return <div key={eq.course_id}>Loading course...</div>;
  
  return (
    <div key={course.courseId}>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
    </div>
  );
})}
            
        </div>
    );
}

export default View_equiv;

