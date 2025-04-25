import axios, { AxiosError } from 'axios';

// --- Configuration ---
// Securely get your API key and CX ID from environment variables
// IMPORTANT: Do NOT hardcode these here in production code!
const API_KEY: string | undefined = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID: string | undefined = process.env.GOOGLE_CX_ID;

// Define interfaces for better type safety (optional but recommended)
interface SearchResultItem {
    title?: string;
    link?: string;
    snippet?: string;
    // Add other fields you might need from the 'items' array
}

interface SearchResponse {
    kind?: string;
    items?: SearchResultItem[];
    // Add other fields from the response if needed
    searchInformation?: {
        totalResults?: string;
        // ... other search info fields
    };
    error?: { // Structure if Google API returns an error in the JSON body
        code: number;
        message: string;
        errors: any[];
    };
}

// --- Main Search Function ---
export async function performGoogleSearch(query: string): Promise<string> {
    if (!API_KEY || !SEARCH_ENGINE_ID) {
        console.error(
            'Error: GOOGLE_API_KEY or GOOGLE_CX_ID not found in environment variables.'
        );
        console.log(
            'Please ensure you have a .env file with these variables set.'
        );
        return "There is an issue connecting to the google Search API, contact Victorano to resolve it." // Exit if keys are missing
    }

    // API Endpoint
    const url: string = process.env.GOOGLE_SEARCH_URL as string

    // --- Parameters ---
    const params = {
        key: API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: query,
        // Optional parameters (examples):
        num: 3,          // Number of results (default: 10, max: 10)
        // start: 1,         // Start index (for pagination)
        // lr: 'lang_en',    // Restrict to English
        // cr: 'countryNG',  // Restrict to Nigeria (using ISO 3166-1 alpha-2 code)
    };

    console.log(`Performing search for: "${query}"`);
    // Current location context: Lagos, Nigeria. Friday, April 25, 2025 at 8:10:31 PM WAT.

    // --- Make the API Call ---
    try {
        const response = await axios.get<SearchResponse>(url, { params });

        // --- Process the Response (Phase 3 Preview) ---
        const searchResults = response.data; // Axios automatically parses JSON

        // Check for API-level errors returned in the JSON body
        if (searchResults.error) {
            console.error(
                `Google API Error ${searchResults.error.code}: ${searchResults.error.message}`
            );
            return "There is an issue connecting to the google Search API, contact Victorano to resolve it.";
        }

        // Example: Log the results (adjust processing as needed)
        // console.log(JSON.stringify(searchResults, null, 2)); // Pretty print the full JSON

        const items = searchResults.items ?? []; // Use nullish coalescing for safety

        if (items.length > 0) {
            console.log(`\n--- Found ${items.length} Results ---`);
            // items.forEach((item, index) => {
            //     console.log(`\nResult ${index + 1}:`);
            //     console.log(`  Title: ${item.title ?? 'N/A'}`);
            //     console.log(`  Link: ${item.link ?? 'N/A'}`);
            //     console.log(`  Snippet: ${item.snippet ?? 'N/A'}`);
            // });
            // Log estimated total results if available
            if (searchResults.searchInformation?.totalResults) {
                console.log(`\nEstimated Total Results: ${searchResults.searchInformation.totalResults}`);
            }
            return items.map(item => `{snippet: ${item.snippet}, title: #{item.title}, link: ${item.link} }`).join(', ');
        } else {
            console.log('\n--- No results found. ---');
            return "No results found for the given query.";
        }

    } catch (error) {
        console.error('Error making API request:');
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<SearchResponse>; // Type assertion
            // Log specific Axios error details
            console.error(`  Status: ${axiosError.response?.status ?? 'N/A'}`);
            // Google API often returns error details in the response body
            if (axiosError.response?.data?.error) {
                    console.error(`  API Code: ${axiosError.response.data.error.code}`);
                    console.error(`  Message: ${axiosError.response.data.error.message}`);
            } else {
                    console.error(`  Data: ${JSON.stringify(axiosError.response?.data)}`);
            }
             // Log the original error message too
                console.error(`  Axios Message: ${axiosError.message}`);
        } else {
            // Handle non-Axios errors
            console.error('An unexpected error occurred:', error);
        }
        return "An unexpected error occurred. Please try again later.";
    }
}

