# Application Workflow Guide

## Updated Workflow Overview

The application now features a clearer separation between recipe creation and meal planning, providing a more intuitive user experience. This document outlines the new workflow and its components.

## Recipe Management

### Recipe Creation

1. **Create New Recipe**
   - Fill in the following required fields:
     - Recipe Name
     - Servings
     - At least one ingredient
     - At least one instruction
   - Optional fields include:
     - Description
     - Prep Time (no longer required)
     - Cook Time
     - Recipe Type (meal categories, now optional)
     - Cuisine
     - Rating
     - Notes

2. **Import Recipe**
   - Import from URL
   - Future support for social media imports (Instagram, TikTok)
   - Imported recipes can be modified as needed

## Meal Planning

### Two-Step Process

The meal planning process now follows a clear two-step approach:

1. **Recipe Selection**
   - Choose from existing recipes in your collection
   - Create a new recipe on the fly
   - Import a recipe from an external source

2. **Meal Scheduling (via ScheduleMealModal)**
   - After selecting a recipe, schedule it in your meal plan by:
     - Selecting which meal of the day (breakfast, lunch, dinner, etc.)
     - Choosing which day(s) of the week
     - Optional: Adjusting the number of servings

### Key Components

#### AddMealModal
- Purpose: Create or modify recipes
- No longer handles meal planning directly
- Focused solely on recipe details
- Required fields: name, servings, ingredients, instructions

#### ScheduleMealModal
- Purpose: Schedule a selected recipe in your meal plan
- Required fields:
  - Selected recipe
  - Meal type (breakfast, lunch, dinner, snack, dessert)
  - At least one day selected
- Allows for serving size adjustments
- Clear separation from recipe creation

## Workflow Benefits

1. **Improved User Experience**
   - Clear distinction between creating recipes and planning meals
   - More focused interface for each task
   - Reduced form complexity

2. **Flexible Recipe Management**
   - Fewer required fields for recipes
   - Prep time now optional, accommodating various recipe types
   - Meal type categorization optional

3. **Streamlined Meal Planning**
   - Simplified scheduling process
   - Focused on essential meal planning details
   - Better handling of repeated meals across multiple days

## Data Model Changes

- `Recipe.prepTime` and `Recipe.cookTime` are now optional fields
- `Recipe.mealTypes` is now optional
- New `MealPlanMealType` represents the meal of the day for planning purposes
- Separated recipe creation from meal scheduling in the interface 