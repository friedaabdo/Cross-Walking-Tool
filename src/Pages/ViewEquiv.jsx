import "./View_equiv.css";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

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
        fetch(`/api/cuny-courses/${eq.courseId}`)
          .then((res) => res.json())
          .then((course) => ({ [eq.courseId]: course })),
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
      <>
      <h1>{learningExperience?.title} Equivalencies</h1>
      <p>
        {learningExperience?.link ? (
          <a
            href={learningExperience.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open learning experience link"
            title="Open learning experience link"
          >
            <FontAwesomeIcon icon={faLink} className="icon-primary" />
          </a>
        ) : null}
      </p></>
      
      <p>{learningExperience?.description}</p>
      <h2>Possible Equivalencies</h2>
      {equivalencies.length === 0 && <p>No equivalencies found for this learning experience.</p>}
     
      {equivalencies.map((eq) => {
        const course = courses[eq.courseId];
        if (!course) return <div key={eq.courseId}>Loading course...</div>;

        return (
          <div key={course.courseId} className="equivalency-card">
            <Link to={buildCrosswalkPath(eq.courseId, eq.matchId)}>
              <h4>{course.title}</h4>
            </Link>
            <p>{course.description}</p>
            <p>{course.user ? `Created by: ${course.user}` : 'Created by: Unknown'}</p>
          </div>
        );
      })}
    </div>
  );
}

export default View_equiv;
