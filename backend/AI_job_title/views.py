from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from django.conf import settings

# Import your custom JWT authentication
from getUserData.JWT import CustomJWTAuthentication

# Pydantic models for input/output (Structured Output Model)
class ProfessionalJobTitleRequest(BaseModel):
    job_title: str = Field(..., description="The job title to be made more professional")

class ProfessionalJobTitleResponse(BaseModel):
    professional_job_title: str = Field(..., description="The enhanced professional job title")

# Groq Model Setup
llm = ChatGroq(model="mixtral-8x7b-32768", api_key=settings.GROQ_API_KEY)

# Structured Output Model (for Groq)
class JobTitleEnhancementOutput(BaseModel):
    professional_job_title: str

# Prepare a prompt template for the job title enhancement
job_title_prompt_template = """
The following is a job title that needs to be made more professional. Please enhance the job title and make it sound more polished:
Job Title: {job_title}
"""

prompt_template = PromptTemplate(input_variables=["job_title"], template=job_title_prompt_template)

# Use the structured LLM with the output model defined
structured_llm = llm.with_structured_output(JobTitleEnhancementOutput)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def enhance_job_title(request):
    # Ensure that the job title is provided in the request body
    if not request.data.get('prompt'):
        return Response(
            {'error': 'Job title is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    job_title = request.data.get('prompt')

    # Create the prompt using the job title from the request
    prompt = prompt_template.format(job_title=job_title)

    try:
        # Generate a more professional job title using Groq/Mistral through structured_llm
        response = structured_llm.invoke(prompt)  # Correctly using the structured_llm
        
        # Debug: Print the raw response

        # Check if the response contains the expected field
        if hasattr(response, 'professional_job_title'):
            professional_job_title = response.professional_job_title
        else:
            professional_job_title = 'No professional job title found'

        # Return the structured response (professional job title)
        return Response(
            {'professional_job_title': professional_job_title},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        # Log the exception and return an error response
        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
