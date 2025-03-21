import React, { useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { extractRecipeFromHtml } from '../../services/gemini';

interface RecipeBrowserProps {
  onRecipeExtracted: (recipeData: any) => void;
}

const RecipeBrowser: React.FC<RecipeBrowserProps> = ({ onRecipeExtracted }) => {
  const [url, setUrl] = useState('https://');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  
  // JavaScript to inject into the page to extract recipe data
  const injectedJavaScript = `
    // Code to extract schema.org/Recipe data
    (function() {
      const extractRecipeData = () => {
        // Look for JSON-LD
        const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]');
        for (const element of jsonLdElements) {
          try {
            const data = JSON.parse(element.textContent);
            // Handle direct Recipe type
            if (data['@type'] === 'Recipe') {
              return { type: 'json-ld', data };
            }
            // Handle array of types
            if (Array.isArray(data['@type']) && data['@type'].includes('Recipe')) {
              return { type: 'json-ld', data };
            }
            // Handle @graph with Recipe type
            if (Array.isArray(data['@graph']) && 
                data['@graph'].some(item => 
                  item['@type'] === 'Recipe' || 
                  (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
                )) {
              return { type: 'json-ld', data };
            }
          } catch (e) {
            // Continue if parsing fails
            console.log('Error parsing JSON-LD:', e);
          }
        }
        
        // Look for microdata
        const recipeElement = document.querySelector('[itemtype$="/Recipe"], [itemtype$="schema.org/Recipe"]');
        if (recipeElement) {
          // Extract microdata elements
          return { 
            type: 'microdata', 
            data: {
              name: recipeElement.querySelector('[itemprop="name"]')?.textContent,
              // More properties could be extracted here
            } 
          };
        }
        
        return null;
      };
      
      const recipeData = extractRecipeData();
      if (recipeData) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'recipe-found',
          recipeData 
        }));
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'no-recipe-found',
          html: document.documentElement.outerHTML,
        }));
      }
    })();
    true; // Important for injectedJavaScript
  `;
  
  const handleMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'recipe-found') {
        setLoading(true);
        console.log('Recipe found with schema:', message.recipeData);
        onRecipeExtracted(formatRecipeData(message.recipeData));
        setLoading(false);
      } else if (message.type === 'no-recipe-found') {
        setLoading(true);
        console.log('No recipe schema found, using Gemini fallback');
        // Use Gemini for extraction when schema is not found
        const result = await extractRecipeFromHtml(message.html, url);
        if (result.error) {
          setError(result.error);
          setLoading(false);
        } else if (result.text) {
          try {
            const parsedData = JSON.parse(result.text);
            onRecipeExtracted({
              type: 'gemini-extracted',
              data: parsedData
            });
          } catch (error) {
            setError('Failed to parse Gemini response');
          }
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setError('Error processing recipe data');
      setLoading(false);
    }
  };
  
  const formatRecipeData = (recipeData: any) => {
    // Transform extracted data to match app's recipe model
    if (recipeData.type === 'json-ld') {
      const data = recipeData.data;
      let recipe = data;
      
      // Handle @graph format where recipe is in a graph array
      if (data['@graph']) {
        recipe = data['@graph'].find((item: any) => 
          item['@type'] === 'Recipe' || 
          (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
        );
      }
      
      // Extract ingredients as objects
      const ingredients = Array.isArray(recipe.recipeIngredient) 
        ? recipe.recipeIngredient.map((ingredient: string) => {
            // Simple parsing logic - this should be enhanced for better extraction
            const parts = ingredient.split(' ');
            let quantity = parts[0];
            let unit = parts[1] || '';
            let name = parts.slice(2).join(' ');
            
            return {
              quantity: isNaN(Number(quantity)) ? quantity : Number(quantity),
              unit,
              name,
              notes: null
            };
          })
        : [];
      
      return {
        name: recipe.name || '',
        description: recipe.description || '',
        prepTime: recipe.prepTime || null,
        cookTime: recipe.cookTime || null,
        totalTime: recipe.totalTime || null,
        servings: recipe.recipeYield || recipe.yield || 0,
        ingredients,
        instructions: extractInstructions(recipe.recipeInstructions),
        imageUrl: Array.isArray(recipe.image) 
          ? recipe.image[0] 
          : (typeof recipe.image === 'string' 
             ? recipe.image 
             : recipe.image?.url),
        cuisine: Array.isArray(recipe.recipeCuisine) 
          ? recipe.recipeCuisine 
          : (recipe.recipeCuisine ? [recipe.recipeCuisine] : []),
        source: {
          type: 'url',
          url: recipe.url || url,
          title: recipe.name || null,
        }
      };
    }
    
    return recipeData;
  };
  
  const extractInstructions = (recipeInstructions: any) => {
    if (!recipeInstructions) return [];
    
    if (typeof recipeInstructions === 'string') {
      // Split by newlines or periods if it's a string
      return recipeInstructions
        .split(/\.\s|\n/)
        .map(instruction => instruction.trim())
        .filter(instruction => instruction.length > 0);
    } else if (Array.isArray(recipeInstructions)) {
      // Handle array of objects or strings
      return recipeInstructions.map(instruction => {
        if (typeof instruction === 'string') {
          return instruction;
        } else if (instruction.text) {
          return instruction.text;
        } else if (instruction.itemListElement) {
          // Handle nested HowToStep elements
          return instruction.itemListElement
            .map((step: any) => step.text || step)
            .join(' ');
        }
        return '';
      }).filter((instruction: string) => instruction.length > 0);
    }
    
    return [];
  };

  const handleNavigate = () => {
    if (!url.startsWith('http')) {
      setUrl(`https://${url}`);
    }
    setLoading(true);
    setError(null);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.urlBar}>
        <TextInput
          style={styles.urlInput}
          value={url}
          onChangeText={setUrl}
          placeholder="Enter recipe URL"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onSubmitEditing={handleNavigate}
        />
        <TouchableOpacity style={styles.goButton} onPress={handleNavigate}>
          <Text style={styles.goButtonText}>Go</Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onLoadEnd={() => {
          setLoading(false);
          // Inject JavaScript to extract recipe data after page loads
          webViewRef.current?.injectJavaScript(injectedJavaScript);
        }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        style={styles.webView}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  urlBar: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  urlInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  goButton: {
    marginLeft: 8,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  goButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  loadingText: {
    marginTop: 10,
    color: '#6200ee',
  },
  errorContainer: {
    padding: 8,
    backgroundColor: '#ffebee',
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
  },
});

export default RecipeBrowser; 