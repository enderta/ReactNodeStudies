import React from 'react'
import Button from "react-bootstrap/Button";
import Read from "./Read";

function Single(props) {
    const [loading, setLoading] = React.useState(false);
    const handleClick = () => {
        setLoading(true);
        window.location.href = `/post/${props.id}`
    }


  return (
    <div>
        {loading ? <h5 style={{color: "goldenrod", textAlign: "center"}}>loading...</h5> : (
            <div>
                <Button onClick={handleClick}>Read more</Button>
            </div>
        )}


    </div>
  )
}

export default Single
