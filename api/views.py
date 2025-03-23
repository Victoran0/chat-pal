from django.shortcuts import render

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .agent import get_agent_response

# Create your views here.


class ChatViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        """handle requests from users and generate a response by calling get_agent_response"""
        # use .get to prevent KeyError
        if not request.data.get("body"):
            return Response({"response": "request must have a 'body' field"}, status=status.HTTP_400_BAD_REQUEST)

        user_req = request.data["body"]
        print("The user's request: ", user_req)
        try:
            agent_response = get_agent_response(user_req)
            print("The agent response: ", agent_response)
        except Exception as e:
            print(f"Error occurred: {e}")
            return Response({"error": "Am error occured while processing your request"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"agent_response": agent_response}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        return Response({"message": "Send a POST request with a body"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
