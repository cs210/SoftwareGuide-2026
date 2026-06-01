import { useEffect, useState, useRef } from 'react';
import ImageMapper from 'react-img-mapper';
import teamsJson from './teams.json'

const ResponsiveImageMapper = ({ src, map, imgWidth, clickFunc, parentWidth = '100%', showTeamLabels = true }) => {
  const [dimensions, setDimensions] = useState({ width: 0 });
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverCoords, setHoverCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const getPolygonCenter = (coords) => {
    let sumX = 0;
    let sumY = 0;
    const points = coords.length / 2;
    for (let i = 0; i < coords.length; i += 2) {
      sumX += coords[i];
      sumY += coords[i + 1];
    }
    return [sumX / points, sumY / points];
  };

  const updateDimensions = () => {
    if (containerRef.current) {
      setDimensions({ width: containerRef.current.clientWidth });
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const scaledCoords = (coords, scale) => {
    return coords.map(coord => coord * scale);
  };

  const scale = dimensions.width / imgWidth;
  const shiftDown = 20;
  const shiftLeft = -15;
  const baseFontSize = 10;
  const baseSize = 20; // Base size of the circle in pixels

  const handleMouseEnter = (index, coords) => {
    setHoverIndex(index);
    const [x, y] = getPolygonCenter(scaledCoords(coords, scale));
    setHoverCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div ref={containerRef} style={{ width: parentWidth, position: 'relative', display: 'inline-block' }}>
      {map.areas.map((area, index) => {
        const scaledAreaCoords = scaledCoords(area.coords, scale);
        const [centerX, centerY] = getPolygonCenter(scaledAreaCoords);
        const nameParts = area.name.split('-');
        const tableNum = nameParts[nameParts.length - 1];
        const fontSize = baseFontSize * scale; // Scale the font size
        const size = baseSize * scale; // Scale the size of the circle

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: centerX - size / 2 + shiftLeft * scale, // Center horizontally and adjust left
              top: centerY - size / 2 + shiftDown * scale, // Center vertically and adjust down
              borderRadius: '25%',
              textAlign: 'center',
              width: `${size * 1.1}px`, // Set scaled width
              height: `${size * 1.1}px`, // Set scaled height
              lineHeight: `${size}px`, // Center text vertically
              fontSize: `${fontSize}px`, // Set font size
              color: 'white', // Set font color to white
              fontWeight: 'bold', // Make the font bold
              backgroundColor: '#52525b', // Set background color
              zIndex: 10 // Ensure the number is above the image
            }}
          >
            {tableNum}
          </div>
        );
      })}
      {showTeamLabels && hoverIndex !== null && teamsJson[hoverIndex] && (
        <div
          className="absolute bg-zinc-700 text-white text-xs rounded py-1 px-2 z-20"
          style={{
            top: `${hoverCoords.y - baseSize}px`,
            left: `${hoverCoords.x}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {teamsJson[hoverIndex]["teamName"]}
          <svg
            className="absolute left-1/2 transform -translate-x-1/2 -bottom-1"
            width="20"
            height="10"
            viewBox="0 0 20 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ zIndex: 21 }}
          >
            <polygon points="0,0 20,0 10,10" fill="#3f3f46" />
          </svg>
        </div>
      )}
      <ImageMapper
        src={src}
        map={map}
        imgWidth={imgWidth}
        width={dimensions.width}
        onClick={clickFunc}
        onMouseEnter={showTeamLabels ? (area, index) => handleMouseEnter(index, area.coords) : undefined}
        onMouseLeave={showTeamLabels ? handleMouseLeave : undefined}
        responsive={false}
      />
    </div>
  );
};

export default ResponsiveImageMapper;


