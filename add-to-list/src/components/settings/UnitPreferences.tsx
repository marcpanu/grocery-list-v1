import React, { ChangeEvent } from 'react';
import {
  Box,
  FormControl as ChakraFormControl,
  FormLabel as ChakraFormLabel,
  Select as ChakraSelect,
  VStack,
  Heading,
  Text,
  Divider,
} from '@chakra-ui/react';
import { UserPreferences } from '../../types';

interface UnitPreferencesProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
}

const UnitPreferences: React.FC<UnitPreferencesProps> = ({
  preferences,
  onUpdatePreferences,
}) => {
  const handleUnitChange = (
    field: 'mass' | 'volume',
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    onUpdatePreferences({
      unitPreferences: {
        groceryList: {
          mass: field === 'mass' ? (value as 'g' | 'lb_oz') : (preferences.unitPreferences?.groceryList?.mass || 'g'),
          volume: field === 'volume' ? (value as 'ml' | 'fl_oz' | 'cups') : (preferences.unitPreferences?.groceryList?.volume || 'ml'),
        },
      },
    });
  };

  const massUnit = preferences.unitPreferences?.groceryList?.mass || 'g';
  const volumeUnit = preferences.unitPreferences?.groceryList?.volume || 'ml';

  return (
    <Box p={4}>
      <VStack spacing={8} align="stretch">
        <Heading size="md">Unit Preferences</Heading>
        
        {/* Grocery List Units */}
        <Box>
          <Text fontWeight="medium" mb={4}>Grocery List Units</Text>
          <VStack spacing={6} align="stretch">
            <ChakraFormControl>
              <ChakraFormLabel>Mass Units</ChakraFormLabel>
              <ChakraSelect
                value={massUnit}
                onChange={(e) => handleUnitChange('mass', e)}
              >
                <option value="g">Grams (g)</option>
                <option value="lb_oz">Pounds/Ounces (lb/oz)</option>
              </ChakraSelect>
            </ChakraFormControl>

            <ChakraFormControl>
              <ChakraFormLabel>Volume Units</ChakraFormLabel>
              <ChakraSelect
                value={volumeUnit}
                onChange={(e) => handleUnitChange('volume', e)}
              >
                <option value="ml">Milliliters (ml)</option>
                <option value="fl_oz">Fluid Ounces (fl oz)</option>
                <option value="cups">Cups</option>
              </ChakraSelect>
            </ChakraFormControl>
          </VStack>
        </Box>

        <Divider />

        {/* Recipe Units (Non-functional) */}
        <Box opacity={0.6}>
          <Text fontWeight="medium" mb={4}>Recipe Units (Coming Soon)</Text>
          <VStack spacing={6} align="stretch">
            <ChakraFormControl>
              <ChakraFormLabel>Mass Units</ChakraFormLabel>
              <ChakraSelect isDisabled>
                <option value="g">Grams (g)</option>
                <option value="lb_oz">Pounds/Ounces (lb/oz)</option>
              </ChakraSelect>
            </ChakraFormControl>

            <ChakraFormControl>
              <ChakraFormLabel>Volume Units</ChakraFormLabel>
              <ChakraSelect isDisabled>
                <option value="ml">Milliliters (ml)</option>
                <option value="fl_oz">Fluid Ounces (fl oz)</option>
                <option value="cups">Cups</option>
              </ChakraSelect>
            </ChakraFormControl>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default UnitPreferences; 