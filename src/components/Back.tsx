import { useNavigate } from "react-router-dom";

const BackButton = ({
  label = "Back",
  to = null,
  style = {},
  className = "",
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to); // go to specific route
    } else {
      navigate(-1); // go to previous page
    }
  };

  return (
    <button
      onClick={handleBack}
      style={{
        padding: "6px 12px",
        cursor: "pointer",
        marginBottom: "10px",
        ...style,
      }}
      className={className}
    >
      ← {label}
    </button>
  );
};

export default BackButton;
