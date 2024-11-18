import styled from '@emotion/styled';

type TileProps = {
    bgColor?: string;
};

const Tile = styled.div`
    width: 35px;
    height: 35px;
    background-color: ${(props: TileProps) => props.bgColor || 'red'};
`;

export default Tile;
