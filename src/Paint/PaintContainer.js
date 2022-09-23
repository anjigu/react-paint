import styled from 'styled-components';
import Paint from './Paint';


const PaintCSS = styled.div`
    padding: 12px;
    background-color: var(--gray-10);
    border-radius: 2px;
    @keyframes fadeInPaint {
    from {
        opacity: 0;
        transform: translateY(30vh);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
    }
    animation: fadeInPaint 1s ease-in-out;
    animation-fill-mode: both;

    .p-div {
        background-color: rgba(195, 240, 108, 0.3);
        text-align: center;
        height: 3em;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
    }

    .p-div:hover {
        background-color: rgba(195, 240, 108, 1);
        transition: all 0.4s ease-in-out 0.5s;
    }
`;

const PaintContainer = () => {

    return(
        <PaintCSS>
            <Paint />
            <div className='p-div'>
                <p>Canvas</p>
            </div>
        </PaintCSS>
    )
}

export default PaintContainer;