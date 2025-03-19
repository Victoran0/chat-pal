from django.shortcuts import render

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

# Create your views here.


class ChatViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        """handle requests from users and generate a response"""
        if not request.data["body"]:
            return Response({"response": "request must have a body"}, status=status.HTTP_400_BAD_REQUEST)

        user_req = request.data["body"]
        print("The user's request: ", user_req)

        return Response({"message": "Received successfully"}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        return Response({"message": "Send a post request with a body"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
