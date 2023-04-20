import React from 'react'
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBookOpenReader} from '@fortawesome/free-solid-svg-icons';

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
                    <Button variant="outline-danger" onClick={handleClick}>
                        <FontAwesomeIcon icon={faBookOpenReader}/>
                    </Button>

                </div>
            )}
        </div>
    )
}

export default Single
