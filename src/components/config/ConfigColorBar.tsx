import "react-color-palette/lib/css/styles.css";

import {
  Box,
  Card,
  DragHandle,
  Flex,
  FormLabel,
  IconButton,
  Popover,
  TextInput,
  Tooltip,
} from "@contentful/f36-components";
import { DeleteIcon } from "@contentful/f36-icons";
import tokens from "@contentful/f36-tokens";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { css } from "emotion";
import React from "react";
import { useState } from "react";
import { Color, ColorPicker, toColor, useColor } from "react-color-palette";

import { TypeColorGroupsState } from "../../utils/types";

const inputLabelStyles = css({
  margin: 0,
  marginLeft: tokens.spacingXs,
  fontWeight: tokens.fontWeightDemiBold,
  color: tokens.gray900,
  fontSize: `0.675rem`,
  lineHeight: tokens.lineHeightS,
  letterSpacing: tokens.letterSpacingWide,
  textTransform: `uppercase`,
});

type TypeOnChange = {
  id: string;
  label?: string;
  hexColor?: string;
  remove?: boolean;
};

type TypeConfigColorBar = {
  id: string;
  label: string;
  hexColor: string;
} & TypeColorGroupsState;

export const ConfigColorBar = ({
  id,
  label,
  hexColor,
  colorGroups,
  setColorGroups,
}: TypeConfigColorBar) => {
  const [color, setColor] = useColor(`hex`, hexColor);
  const [isOpen, setIsOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, active } =
    useSortable({ id });

  const onChange = ({ id, label, hexColor, remove }: TypeOnChange) => {
    const updatedColorGroups = [...colorGroups];
    const groupIndex = updatedColorGroups.findIndex((group) =>
      group.definedColors.some((color) => color.id === id)
    );

    if (groupIndex >= 0) {
      const colorIndex = updatedColorGroups[groupIndex].definedColors.findIndex(
        (color) => color.id === id
      );

      if (colorIndex >= 0) {
        if (remove) {
          updatedColorGroups[groupIndex].definedColors.splice(colorIndex, 1);
          setColorGroups(updatedColorGroups);
          return;
        }

        if (hexColor || hexColor === ``) {
          updatedColorGroups[groupIndex].definedColors[colorIndex].hexColor =
            hexColor;
        }

        if (label || label === ``) {
          updatedColorGroups[groupIndex].definedColors[colorIndex].label =
            label;
        }

        setColorGroups(updatedColorGroups);
      }
    }
  };

  const zIndex = active && active.id === id ? 1 : 0;
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex,
  };

  const setLabelValue = (e: any) => {
    const { value } = e.target;

    onChange({ id, label: value as string });
  };

  const handleChange = (color: Color | string) => {
    if (typeof color === `string`) {
      const colorObject = toColor(`hex`, color);
      setColor(colorObject);
      onChange({ id, hexColor: colorObject.hex });
    } else {
      setColor(color);
      onChange({ id, hexColor: color.hex });
    }
  };

  return (
    <Card
      className={css({ position: `relative`, marginBottom: `1rem` })}
      dragHandleRender={() => (
        <DragHandle
          as={`button`}
          className={css({ alignSelf: `stretch` })}
          label={`Move card`}
          {...attributes}
          {...listeners}
        />
      )}
      padding="none"
      withDragHandle
      ref={setNodeRef}
      style={style}
    >
      <Flex
        padding={`spacingM`}
        alignItems={`flex-end`}
        justifyContent={`center`}
        className={css({
          gap: `1rem`,
          padding: `0.75rem`,
        })}
      >
        <Popover
          placement={`right-start`}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <Popover.Trigger>
            <Box
              onClick={() => setIsOpen(!isOpen)}
              className={css({
                backgroundColor: hexColor,
                width: `32px`,
                height: `32px`,
                border: `1px solid #CFD9E0`,
                borderRadius: `6px`,
                cursor: `pointer`,
                flexShrink: 0,
                transition: `box-shadow 0.1s ease`,
                ":hover": {
                  boxShadow: tokens.boxShadowDefault,
                },
              })}
            />
          </Popover.Trigger>
          <Popover.Content className={css({ margin: `1rem` })}>
            <Box>
              <ColorPicker
                width={456}
                height={228}
                color={color}
                onChange={handleChange}
              />
            </Box>
          </Popover.Content>
        </Popover>
        <Flex flexBasis={`50%`} flexDirection={`column`}>
          <FormLabel className={inputLabelStyles}>HEX</FormLabel>
          <TextInput
            size={`small`}
            value={hexColor}
            onChange={(e) => handleChange(e.target.value)}
          />
        </Flex>
        <Flex flexBasis={`50%`} flexDirection={`column`}>
          <FormLabel className={inputLabelStyles}>Label</FormLabel>
          <TextInput
            size={`small`}
            value={label}
            onChange={(e) => setLabelValue(e)}
          />
        </Flex>
        <Tooltip placement={`top`} content={`Delete color`}>
          <IconButton
            aria-label={`Delete color`}
            variant={`negative`}
            size={`small`}
            icon={<DeleteIcon />}
            onClick={() => onChange({ id, remove: true })}
          />
        </Tooltip>
      </Flex>
    </Card>
  );
};
