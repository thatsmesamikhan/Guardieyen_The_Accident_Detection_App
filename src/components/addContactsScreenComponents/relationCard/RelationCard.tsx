import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ACTIVE_OPACITY, COLORS, FONT, hp } from '../../../enums/StyleGuide';
import { TextLabel } from '../../../commons';

interface RelationItem {
    title: string;
}

interface Props {
    setSelectedRelation: (relation: string) => void;
    item: RelationItem;
    selectedRelation: string
}

const RelationCard = ({ selectedRelation, setSelectedRelation, item }: Props) => {
    const isSelected = selectedRelation === item?.title;
    return (
        <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            onPress={() => setSelectedRelation(item.title)}
            style={[styles.container, { backgroundColor: isSelected ? COLORS.red : COLORS.lightRed }]}
        >
            <TextLabel
                text={item.title}
                style={{
                    fontFamily: FONT.medium,
                    color: isSelected ? COLORS.white : COLORS.red,
                }}
            />
        </TouchableOpacity>
    );
};

export default React.memo(RelationCard);

const styles = StyleSheet.create({
    container: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: COLORS.red,
        marginTop: hp('1%'),
        width: '24%',
    }
})