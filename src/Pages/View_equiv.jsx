import "./View_equiv.css";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

function View_equiv() {
  const { experienceId } = useParams();
  const [equivalencies, setEquivalencies] = useState([]);
  const [learningExperience, setLearningExperience] = useState(null);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(() => Boolean(experienceId));
  const [error, setError] = useState(null);
  const missingExperienceId = !experienceId;

  const buildCrosswalkPath = (courseId, matchId) => {
    const queryParams = new URLSearchParams({
      courseId: String(courseId),
      experienceId: String(experienceId),
    });

    if (matchId) {
      queryParams.set("matchId", String(matchId));
    }

    return `/crosswalk?${queryParams.toString()}`;
  };

  useEffect(() => {
    let mounted = true;
    if (!experienceId) {
      return;
    }

    setLoading(true);
    setError(null);

    const loadEquivalencyData = async () => {
      try {
        const [learningExperienceResponse, equivalenciesResponse] = await Promise.all([
          fetch(`/api/learning-experiences/${experienceId}`),
          fetch(`/api/matches/equivalency/${experienceId}`),
        ]);

        if (!learningExperienceResponse.ok || !equivalenciesResponse.ok) {
          throw new Error("Network response was not ok");
        }

        const [learningExperienceData, equivalenciesData] = await Promise.all([
          learningExperienceResponse.json(),
          equivalenciesResponse.json(),
        ]);

        if (!mounted) {
          return;
        }

        setLearningExperience(learningExperienceData);
        setEquivalencies(equivalenciesData);
        console.log("Fetched learning experience data:", learningExperienceData);
        console.log("Fetched equivalencies data:", equivalenciesData);
      } catch (error) {
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEquivalencyData();

    return () => {
      mounted = false;
    };
  }, [experienceId]);

  useEffect(() => {
    if (equivalencies.length === 0) {
      setCourses({});
      return;
    }

    Promise.all(
      equivalencies.map((eq) =>
        fetch(`/api/cuny-courses/${eq.course_id}`)
          .then((res) => res.json())
          .then((course) => ({ [eq.course_id]: course })),
      ),
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
      <h1>{learningExperience?.title} Equivalencies</h1>

      <p>
        This page will list the CUNY courses that have been marked as equivalent
        to the learning experience.
      </p>
      {equivalencies.map((eq) => {
        const course = courses[eq.course_id];
        if (!course) return <div key={eq.course_id}>Loading course...</div>;

        return (
          <div key={course.courseId}>
            <Link to={buildCrosswalkPath(eq.course_id, eq.match_id)}>
              <h2>{course.title}</h2>
            </Link>
            <p>{course.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export default View_equiv;
