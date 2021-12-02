import "./style.scss";
import config from "../../config.json";
import { Link } from "react-router-dom";

const Collections = () => {
  return (
    <>
      {config.collections.map((collection, index) => (
        <Link key={index} to={`collection/${collection.name}`}>
          {collection.name}
        </Link>
      ))}
    </>
  );
};

export default Collections;
