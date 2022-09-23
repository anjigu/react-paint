import { useEffect, useRef, useState } from 'react';
import './Paint.css';

export default function Paint() {
  const canvasRef = useRef(null);
  const brushRangeRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inputValue, setInputValue] = useState({
    range: 12,
    color: '#000000',
    resetColor: '#ffffff',
  });
  const [history, setHistory] = useState({
    data: [],
    current: -1,
  });
  const [windowSize, setWindowSize] = useState({
    width: Math.min(window.innerWidth * 0.9, 864),
    height: window.innerHeight * 0.55,
  });

  // 마우스 핸들러: 마우스 각 이벤트마다의 핸들링을 한 함수에 우겨넣음
  const handleMouse = (e) => {
    // legacy event 꺼내오는 메서드
    e.persist();
    const { offsetX, offsetY } = e.nativeEvent;
    // 마우스 움직일 때
    if (e.type === 'mousemove') {
      if (ctx) {
        // 그리고 있는 상태를 관리하여 선이 그려지도록 하는 코드
        if (!isDrawing) {
          ctx.beginPath();
          ctx.moveTo(offsetX, offsetY);
        } else {
          ctx.lineTo(offsetX, offsetY);
          ctx.stroke();
        }
      }
    }
    // 마우스 누를 때 그리고 있음을 상태로 저장함
    if (e.type === 'mousedown') {
      setIsDrawing(true);
    }
    // 마우스 뗄 때와 캔버스 밖으로 나갈 때 그리기가 종료됨을 상태로 저장함.
    if (isDrawing && (e.type === 'mouseup' || e.type === 'mouseleave')) {
      setIsDrawing(false);
      
      // 그리기가 종료될 때 해당 이력을 history 상태에 객체형태로 저장함
      // 저장 형태는 캔버스 전체를 사진 찍듯이 찍어 dataURL 형태로 저장
      // history.data는 스택 자료구조의 형태
      let { data, current } = history;
      if (data.length > 0) {
        const changedData = [
          ...data.slice(0, current + 1),
          ctx.canvas.toDataURL(),
        ];
        setHistory({ data: changedData, current: current + 1 });
      } else {
        const changedData = [...data, ctx.canvas.toDataURL()];
        setHistory({ data: changedData, current: current + 1 });
      }
    }
  };

  // input 태그의 value 속성을 위한 핸들러
  const handleInput = (key) => (e) => {
    setInputValue({ ...inputValue, [key]: e.target.value });
  };

  // 버튼 클릭 핸들러
  const handleClick = (key) => (e) => {
    // 초기화 버튼 누를 시 캔버스와 해당 이력을 모두 초기화함
    if (key === 'reset') {
      ctx.fillStyle = inputValue.resetColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      setTimeout(() => {
        setHistory({
          data: [ctx.canvas.toDataURL()],
          current: 0,
        });
      }, 200);
    }
  };

  // 캔버스의 키보드 이벤트
  const handleKeyboard = (e) => {
    if (e.ctrlKey) {
      if (e.key.toLowerCase() === 'z') excuteUndo();
      if (e.key.toLowerCase() === 'y') excuteRedo();
    }
  };

  // 실행취소 함수
  const excuteUndo = () => {
    const { data, current } = history;

    if (current === -1 || current === 0) return;

    const img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(
        img,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    };
    img.src = data[current - 1];

    setHistory({ ...history, current: current - 1 });
  };

  // 다시실행 함수
  const excuteRedo = () => {
    const { data, current } = history;

    if (current === data.length - 1) return;
    const img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(
        img,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    };
    img.src = data[current + 1];

    setHistory({ ...history, current: current + 1 });
  };

  // canvas 엘리먼트의 useRef 갱신시 발생하는 effect
  // 캔버스의 초기상태를 지정해주고, context를 상태로 저장함
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineWidth = inputValue.range;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = inputValue.color;
    context.fillStyle = '#fff';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    setHistory({
      data: [context.canvas.toDataURL()],
      current: 0,
    });
    setCtx(context);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  // 캔버스 반응형 조작을 위한 effect
  useEffect(() => {
    if (ctx) {
      ctx.lineWidth = inputValue.range;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = inputValue.color;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      setHistory({
        data: [ctx.canvas.toDataURL()],
        current: 0,
      });
    }
  }, [windowSize.width, windowSize.height]);

  // input value가 바뀜에 따라 캔버스 브러쉬 형태를 지정해주는 effect
  useEffect(() => {
    if (ctx) {
      ctx.lineWidth = inputValue.range;
      ctx.strokeStyle = inputValue.color;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue.color, inputValue.range]);

  // 본 컴포넌트 마운트시 window 객체에 반응형을 위한 resize 이벤트를 추가해줌
  useEffect(() => {
    const resizeWindow = () => {
      setWindowSize({
        width: Math.min(window.innerWidth * 0.9, 864),
        height: window.innerHeight * 0.55,
      });
    };
    window.addEventListener('resize', resizeWindow);
    return () => {
      window.removeEventListener('resize', resizeWindow);
    };
  }, []);

  return (
    <div className="container">
      <div className="inner">
        <div className="canvas-wrapper">
          <canvas
            width={windowSize.width}
            height={windowSize.height}
            tabIndex="1"
            ref={canvasRef}
            onMouseDown={handleMouse}
            onMouseUp={handleMouse}
            onMouseMove={handleMouse}
            onMouseLeave={handleMouse}
            onKeyDown={handleKeyboard}
            onContextMenu={handleMouse}
          >
            브라우저가 캔버스를 제공하지 않습니다 :(
          </canvas>
          <div>
            <button onClick={excuteUndo}>
              실행취소{' '}
              <span style={{ fontSize: '0.625rem', color: 'var(--gray-500)' }}>
                (Ctrl + Z)
              </span>
            </button>
            <button onClick={excuteRedo}>
              다시실행{' '}
              <span style={{ fontSize: '0.625rem', color: 'var(--gray-500)' }}>
                (Ctrl + Y)
              </span>
            </button>
          </div>
        </div>
        <div className="canvas-option-container">
          <div className="canvas-wrapper options">
            <h3>브러쉬</h3>
            <div className="canvas-brush-color">
              <div>색상:</div>
              <input
                className="color-input"
                onChange={handleInput('color')}
                type="color"
                value={inputValue.color}
              />
              <div>{inputValue.color.toUpperCase()}</div>
            </div>
            <div className="canvas-brush-scale">
              <input
                ref={brushRangeRef}
                onChange={handleInput('range')}
                className="canvas-brush-range"
                type="range"
                value={inputValue.range}
                min="1"
                max="128"
              ></input>
              <input
                onChange={handleInput('range')}
                className="canvas-brush-range-text"
                type="number"
                value={inputValue.range}
              ></input>
            </div>
          </div>
          <div className="canvas-wrapper options">
            <div className="canvas-reset-color">
              <div>색상:</div>
              <input
                className="color-input"
                onChange={handleInput('resetColor')}
                type="color"
                value={inputValue.resetColor}
              />
              <div>{inputValue.resetColor.toUpperCase()}</div>
            </div>
            <div className="canvas-reset-btn">
              <button onClick={handleClick('reset')}>초기화</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
