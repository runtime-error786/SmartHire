from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated
import logging
from langchain.prompts import PromptTemplate
from langchain_community.llms import Ollama
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
import json
import re  # For extracting JSON using regex

# Configure logging
logger = logging.getLogger(__name__)

# Initialize the Ollama LLM with the Dewpseek model
llm = Ollama(model="llama3")

# Define expected JSON response format
class CodeEvaluation(BaseModel):
    result: str = Field(description="yes if code is correct, otherwise no")
    feedback: str = Field(description="Explanation of why the code is correct or incorrect.")

# Code evaluation prompt template
code_prompt_template = PromptTemplate(
    input_variables=["question", "code"],
    template=(
        "Evaluate the correctness of the following code based on the given question.\n"
        "Consider factors such as functionality, correctness, efficiency, and edge case handling.\n"
        "If the code is correct, return 'yes' in the 'result' field; otherwise, return 'no'.\n"
        "Additionally, provide a brief 'feedback' message explaining why the code is correct or incorrect.\n\n"
        "Question: {question}\n"
        "Code:\n```\n{code}\n```\n\n"
        "Return only a JSON object with 'result' and 'feedback'."
        "Returning an error response if the input does not look like code or not match question code requirement"
    )
)

# JSON parser
parser = JsonOutputParser(pydantic_object=CodeEvaluation)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def evaluate_code(request):
    """
    API endpoint to evaluate a candidate's submitted code for correctness.

    Request Body:
    - question: The programming question.
    - code: The JavaScript code submitted by the candidate.

    Response:
    - { "result": "yes", "feedback": "Code is correct and handles edge cases well." }
    - { "result": "no", "feedback": "The code does not correctly sum odd numbers." }
    """
    try:
        data = request.data
        question = data.get("question", "").strip()
        code = data.get("code", "").strip()

        if not question or not code:
            return Response({'error': 'Both question and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Format prompt
        prompt = code_prompt_template.format(question=question, code=code)

        # Invoke model to evaluate the code
        response = llm.invoke(prompt)

        # Log raw response for debugging
        logger.debug(f"Model Response: {response}")

        if not response:
            logger.error("Empty response from model")
            return Response({'error': 'Empty response from model'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Extract JSON from the response using regex
        json_match = re.search(r'\{.*\}', response, re.DOTALL)

        if not json_match:
            logger.error("Failed to extract JSON from model response")
            return Response({'error': 'Invalid response from model'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        json_text = json_match.group()  # Extract the matched JSON part

        # Try parsing response into structured JSON
        try:
            result = json.loads(json_text)
        except json.JSONDecodeError as e:
            logger.error(f"JSON Parsing Error: {str(e)}", exc_info=True)
            return Response({'error': 'Invalid JSON output from model'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Log parsed result for debugging
        logger.debug(f"Parsed Result: {result}")

        # Return the evaluation result
        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        # Handle any unexpected errors
        logger.error(f"Error occurred: {str(e)}", exc_info=True)
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
