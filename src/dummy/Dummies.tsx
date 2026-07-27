import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../assets/images";

export interface Slide {
    id: string;
    image: ImageSourcePropType;
    title: string;
    subtitle: string;
}

export const SLIDES: Slide[] = [
    {
        id: '1',
        image: IMAGES.ON_BOARD_1,
        title: 'Your Guardian, Always Watching',
        subtitle:
            'Stay protected wherever you go. Our intelligent system keeps a watchful eye on your perimeter 24/7.',
    },
    {
        id: '2',
        image: IMAGES.ON_BOARD_2,
        title: 'Real-Time Accident Detection',
        subtitle:
            'Guardieyen uses advanced phone sensors to detect impacts instantly, ensuring help is always on the way.',
    },
    {
        id: '3',
        image: IMAGES.ON_BOARD_3,
        title: 'Instant Emergency Alerts',
        subtitle:
            'In the event of an accident, your location and medical profile are sent to your chosen emergency contacts immediately.',
    },
];