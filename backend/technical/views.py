from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated
import logging
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
import time

# Configure logging
logger = logging.getLogger(__name__)

# API keys for ChatGroq
API_KEYS = [
    "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",
    "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"
]

# Initialize multiple ChatGroq instances
llm_instances = [ChatGroq(model="llama-3.3-70b-versatile", api_key=key) for key in API_KEYS]

# Define a prompt template for coding questions
coding_prompt_template = PromptTemplate(
    input_variables=["topic", "difficulty", "past_questions"],
    template=(
        "Generate a {difficulty} technical coding question about {topic}. "
        "The question should assess the candidate's problem-solving and coding skills. "
        "Avoid questions that are similar to these past questions: {past_questions}. "
        "There is no matching scenario in past questions and new questions. "
        "All questions should be different and based on different scenarios. "
        "Only return the question without additional details."
    )
)

def invoke_with_fallback(prompt):
    """Try invoking ChatGroq with each API key until one succeeds."""
    for llm in llm_instances:
        try:
            response = llm.invoke(prompt)
            return response.content.strip()
        except Exception as e:
            logger.error(f"ChatGroq request failed: {str(e)}")
            time.sleep(60)  # Wait to avoid exceeding rate limits
    raise Exception("All ChatGroq API instances failed due to rate limiting or other errors.")

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_coding_questions(request):
    """
    API endpoint to generate a technical coding question dynamically using LangChain and ChatGroq.
    
    Query Parameters:
    - topic: The topic for the question (default: 'Data Structures').
    - difficulty: The difficulty level of the question (default: 'medium').
    - past_questions: A comma-separated list of past questions to avoid repetition.
    """
    try:
        # Extract query parameters
        topic = request.query_params.get('topic', 'Data Structures')
        difficulty = request.query_params.get('difficulty', 'medium')
        past_questions = request.query_params.get('past_questions', '')
        
        # Validate difficulty level
        if difficulty not in ['easy', 'medium', 'hard']:
            return Response(
                {'error': 'Invalid difficulty level. Choose from easy, medium, or hard.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Convert past questions to a formatted string for the prompt
        past_questions_list = past_questions.split(',') if past_questions else []
        past_questions_str = ", ".join(past_questions_list) if past_questions_list else "None"

        # Generate a new unique question
        prompt = coding_prompt_template.format(topic=topic, difficulty=difficulty, past_questions=past_questions_str)
        generated_question = invoke_with_fallback(prompt)

        # Log the generated question
        logger.info(f"Generated coding question: {generated_question}")

        # Return the new question
        return Response({'question': generated_question}, status=status.HTTP_200_OK)

    except Exception as e:
        # Log and return error response
        logger.error(f"Error occurred: {str(e)}", exc_info=True)
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )