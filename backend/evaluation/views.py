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

# Configure logging
logger = logging.getLogger(__name__)

# Initialize the Ollama LLM with the Dewpseek model
llm = Ollama(model="llama3")

# Define expected JSON response format
class AnswerEvaluation(BaseModel):
    result: str = Field(description="yes if answer is at least 70% correct, otherwise no")

prompt_template = PromptTemplate(
    input_variables=["question", "answer"],
    template=(
        "Evaluate the correctness of the following answer based on the given question. Consider factors like accuracy, relevance, "
        "clarity, and completeness. If the answer demonstrates a clear understanding of key concepts despite minor grammatical errors "
        "or typos, it should still be considered correct. Focus on the core aspects of the answer and whether they address the question's "
        "main points. If the answer is at least 70% correct, return 'yes', otherwise return 'no'. Return only a JSON object with the key 'result'.\n"
        "Question: {question}\n"
        "Answer: {answer}"
    )
)




# JSON parser
parser = JsonOutputParser(pydantic_object=AnswerEvaluation)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def check_answer(request):
    """
    API endpoint to check if an answer is at least 70% correct according to the question's context.
    
    Request Body:
    - question: The interview question.
    - answer: The candidate's answer (transcript from speech-to-text).
    
    Response:
    - { "result": "yes" } if the answer is at least 70% correct.
    - { "result": "no" } otherwise.
    """
    try:
        # Extract question and answer from request
        data = request.data
        question = data.get("question", "").strip()
        answer = data.get("answer", "").strip()
        print(answer)
        if not question or not answer:
            return Response({'error': 'Both question and answer are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Format prompt
        prompt = prompt_template.format(question=question, answer=answer)
        
        # Invoke model to get evaluation
        response = llm.invoke(prompt)
        print(response)
        # Print the response for debugging
        logger.debug(f"Model Response: {response}")  # Print the response from the model
        
        # Parse response into structured JSON
        result = parser.parse(response)
        print(result)
        # Print the parsed result for debugging
        logger.debug(f"Parsed Result: {result}")  # Print the parsed result

        # Return the response directly without calling .dict()
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error occurred: {str(e)}", exc_info=True)
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
