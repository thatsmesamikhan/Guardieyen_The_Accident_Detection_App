import { ImageSourcePropType } from "react-native";
import { IMAGES } from "../assets/images";

type RelationType = 'Spouse' | 'Parent' | 'Sibling' | 'Friend' | 'Other'

interface Contact {
    id: number
    title: string
    relation: RelationType
    image: any
}

interface Slide {
    id: string;
    image: ImageSourcePropType;
    title: string;
    subtitle: string;
}

export interface Section {
    title: string
    data: Contact[]
}

export type Severity = 'High' | 'Moderate' | 'Low'
export type IncidentStatus = 'Resolved' | 'Under Review' | 'False Alarm'

export interface AccidentRecord {
    id: string
    time: string
    date: string
    title: string
    location: string
    severity: Severity
    status: IncidentStatus
    description: string
}

export interface TimelineRowData extends AccidentRecord {
    lineColor: string
    circleColor: string
}

export type SeverityFilter = 'All' | Severity

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

export const relationsData = [
    { id: 1, title: 'Spouse' },
    { id: 2, title: 'Parent' },
    { id: 3, title: 'Sibling' },
    { id: 4, title: 'Friend' },
    { id: 5, title: 'Other' },
]

export const contacts: Contact[] = [
    { id: 1, title: 'Ayesha Khan', relation: 'Spouse', image: IMAGES.USER },
    { id: 2, title: 'Tariq Khan', relation: 'Parent', image: IMAGES.USER },
    { id: 3, title: 'Naz Khan', relation: 'Parent', image: IMAGES.USER },
    { id: 4, title: 'Sami Khan', relation: 'Sibling', image: IMAGES.USER },
    { id: 5, title: 'Ali Khan', relation: 'Sibling', image: IMAGES.USER },
    { id: 6, title: 'Adeel Khan', relation: 'Sibling', image: IMAGES.USER },
    { id: 7, title: 'Hamza Sheikh', relation: 'Friend', image: IMAGES.USER },
    { id: 8, title: 'Bilal Ahmed', relation: 'Friend', image: IMAGES.USER },
    { id: 9, title: 'Dr. Fatima Malik', relation: 'Other', image: IMAGES.USER },
]

export const SECTION_ORDER: { key: RelationType; label: string }[] = [
    { key: 'Spouse', label: 'Spouse' },
    { key: 'Parent', label: 'Parents' },
    { key: 'Sibling', label: 'Siblings' },
    { key: 'Friend', label: 'Friends' },
    { key: 'Other', label: 'Other' },
]

export const homeScreenInfoData = [
    { id: 1, title: 'Sensors', info: 'Active', icon: IMAGES.SENSORS },
    { id: 2, title: 'GPS', info: 'Connected', icon: IMAGES.GPS },
    { id: 3, title: 'Background', info: 'Running', icon: IMAGES.BACKGROUND },
    { id: 4, title: 'Contacts', info: 'Ready', icon: IMAGES.CONTACTS },
]

export const contactsInfo = [
    { id: 1, title: 'Sami Khan', relation: 'Brother', image: IMAGES.USER },
    { id: 2, title: 'Ali Khan', relation: 'Brother', image: IMAGES.USER },
    { id: 3, title: 'Adeel Khan', relation: 'Brother', image: IMAGES.USER },
]

export const bloodGroupInfoData = [
    { id: 1, title: 'BLOOD GROUP', info: 'O+' },
    { id: 2, title: 'CONDITIONS', info: 'Asthma' },
]

export const allergiesData = [
    { id: 1, allergies: 'Peanuts' },
    { id: 2, allergies: 'Penicillin' },
    { id: 3, allergies: 'Dust' },
]

export const locationInfoData = [
    { id: 1, title: 'LATITUDE', info: '28.4201° N' },
    { id: 2, title: 'LONGITUDE', info: '70.2954° E' },
    { id: 3, title: 'ACCURACY', info: '±6m' },
]

export const accidentsHistoryData: AccidentRecord[] = [
    // {
    //     id: '1',
    //     time: '08:42 AM',
    //     date: 'Aug 03, 2026',
    //     title: 'Sudden Fall Detected',
    //     location: 'Model Town, Multan',
    //     severity: 'High',
    //     status: 'Resolved',
    //     description: 'Impact detected via accelerometer. SOS auto-triggered, emergency contacts notified within 12 seconds.',
    // },
    // {
    //     id: '2',
    //     time: '06:15 PM',
    //     date: 'Jul 28, 2026',
    //     title: 'Irregular Heart Rate',
    //     location: 'Cantt Area, Multan',
    //     severity: 'Moderate',
    //     status: 'Resolved',
    //     description: 'Heart rate spiked above the safe threshold for 4 minutes. User confirmed status manually.',
    // },
    // {
    //     id: '3',
    //     time: '11:03 AM',
    //     date: 'Jul 21, 2026',
    //     title: 'Unresponsive Alert Timeout',
    //     location: 'Gulgasht Colony, Multan',
    //     severity: 'High',
    //     status: 'Under Review',
    //     description: 'User did not respond to a check-in prompt within 60 seconds. Nearest contact was alerted.',
    // },
    // {
    //     id: '4',
    //     time: '02:47 PM',
    //     date: 'Jul 12, 2026',
    //     title: 'Minor Impact Detected',
    //     location: 'Shah Rukn-e-Alam, Multan',
    //     severity: 'Low',
    //     status: 'False Alarm',
    //     description: 'Sudden motion flagged as a potential fall. Confirmed by user as a false trigger while exercising.',
    // },
    // {
    //     id: '5',
    //     time: '09:30 AM',
    //     date: 'Jul 04, 2026',
    //     title: 'Geofence Exit Alert',
    //     location: 'Bosan Road, Multan',
    //     severity: 'Moderate',
    //     status: 'Resolved',
    //     description: 'User exited the designated safe zone. Location shared automatically with primary contact.',
    // },
]