#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for AI HR & Support Agent
Tests all endpoints: document upload, chat, resume screening, interview
"""

import requests
import sys
import json
import time
from datetime import datetime
from pathlib import Path
import tempfile
import os

class AIHRAgentTester:
    def __init__(self, base_url="https://companyaide.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session_id = f"test_session_{int(time.time())}"
        self.interview_session_id = f"interview_test_{int(time.time())}"

    def log(self, message):
        """Log test messages with timestamp"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if files is None:
            headers['Content-Type'] = 'application/json'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def create_test_file(self, content, suffix='.pdf'):
        """Create a simple test file"""
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode='w')
        temp_file.write(content)
        temp_file.close()
        return temp_file.name

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_document_upload(self):
        """Test document upload functionality"""
        self.log("📄 Testing Document Upload...")
        
        # Create test file
        test_content = "Test HR Document - Leave Policy: 20 days annual leave. Benefits: Health insurance available."
        test_file_path = self.create_test_file(test_content, '.pdf')
        
        try:
            with open(test_file_path, 'rb') as f:
                files = {'file': ('test_hr_policy.pdf', f, 'application/pdf')}
                data = {'doc_type': 'hr'}
                
                success, response = self.run_test(
                    "Document Upload", 
                    "POST", 
                    "upload-document", 
                    200, 
                    data=data, 
                    files=files
                )
                
                if success and 'doc_id' in response:
                    self.log(f"   Document ID: {response['doc_id']}")
                    return True, response['doc_id']
                return False, None
        finally:
            try:
                os.unlink(test_file_path)
            except:
                pass

    def test_get_documents(self):
        """Test retrieving documents"""
        return self.run_test("Get Documents", "GET", "documents", 200)

    def test_chat_functionality(self):
        """Test HR chat functionality"""
        self.log("💬 Testing Chat Functionality...")
        
        chat_data = {
            "session_id": self.session_id,
            "message": "What is the company leave policy?"
        }
        
        success, response = self.run_test(
            "HR Chat", 
            "POST", 
            "chat", 
            200, 
            data=chat_data
        )
        
        if success:
            if 'response' in response and 'confidence' in response:
                self.log(f"   AI Response: {response['response'][:100]}...")
                self.log(f"   Confidence: {response['confidence']}")
                self.log(f"   Escalated: {response.get('escalated', False)}")
                return True, response
            else:
                self.log("   ❌ Missing required fields in chat response")
                return False, None
        return False, None

    def test_chat_history(self):
        """Test chat history retrieval"""
        return self.run_test(
            "Chat History", 
            "GET", 
            f"chat-history/{self.session_id}", 
            200
        )

    def test_resume_upload(self):
        """Test resume upload functionality"""
        self.log("📋 Testing Resume Upload...")
        
        resume_content = """John Doe - Software Engineer
        Experience: 5 years Python, 3 years React, 2 years team leadership
        Skills: Python, JavaScript, React, FastAPI, MongoDB
        Education: BS Computer Science"""
        
        test_file_path = self.create_test_file(resume_content, '.pdf')
        
        try:
            with open(test_file_path, 'rb') as f:
                files = {'file': ('john_doe_resume.pdf', f, 'application/pdf')}
                
                success, response = self.run_test(
                    "Resume Upload", 
                    "POST", 
                    "upload-resume", 
                    200, 
                    files=files
                )
                
                if success and 'resume_id' in response:
                    self.log(f"   Resume ID: {response['resume_id']}")
                    return True, response['resume_id']
                return False, None
        finally:
            try:
                os.unlink(test_file_path)
            except:
                pass

    def test_get_resumes(self):
        """Test retrieving resumes"""
        return self.run_test("Get Resumes", "GET", "resumes", 200)

    def test_resume_screening(self):
        """Test resume screening functionality"""
        self.log("🎯 Testing Resume Screening...")
        
        job_description = """Senior Software Engineer Position
        Requirements: 5+ years Python, React experience, team leadership, BS Computer Science"""
        
        screening_data = {
            "job_description": job_description
        }
        
        success, response = self.run_test(
            "Resume Screening", 
            "POST", 
            "screen-resumes", 
            200, 
            data=screening_data
        )
        
        if success:
            results = response.get('results', [])
            self.log(f"   Screened {len(results)} resumes")
            for i, result in enumerate(results[:3]):
                filename = result.get('filename', 'Unknown')
                score = result.get('score', 'N/A')
                self.log(f"   #{i+1}: {filename} - Score: {score}")
            return True, results
        return False, None

    def test_interview_functionality(self):
        """Test AI interview functionality"""
        self.log("🎤 Testing Interview Functionality...")
        
        interview_data = {
            "session_id": self.interview_session_id,
            "candidate_name": "Jane Smith",
            "position": "Senior Software Engineer"
        }
        
        success, response = self.run_test(
            "Start Interview", 
            "POST", 
            "interview", 
            200, 
            data=interview_data
        )
        
        if not success:
            return False, None
            
        self.log(f"   Interview started: {response.get('response', '')[:100]}...")
        
        # Send a response
        time.sleep(1)
        
        interview_response = {
            "session_id": self.interview_session_id,
            "candidate_name": "Jane Smith",
            "position": "Senior Software Engineer",
            "message": "I have 6 years of experience in software development with Python and React."
        }
        
        success, response = self.run_test(
            "Interview Response", 
            "POST", 
            "interview", 
            200, 
            data=interview_response
        )
        
        if success:
            self.log(f"   Next question: {response.get('response', '')[:100]}...")
            return True, response
        return False, None

    def test_get_interview_session(self):
        """Test retrieving interview session"""
        return self.run_test(
            "Get Interview Session", 
            "GET", 
            f"interview/{self.interview_session_id}", 
            200
        )

    def run_all_tests(self):
        """Run comprehensive test suite"""
        self.log("🚀 Starting AI HR & Support Agent API Tests")
        self.log(f"   Base URL: {self.base_url}")
        self.log("=" * 60)
        
        tests = [
            ("API Root", self.test_root_endpoint),
            ("Document Upload", self.test_document_upload),
            ("Get Documents", self.test_get_documents),
            ("Chat Functionality", self.test_chat_functionality),
            ("Chat History", self.test_chat_history),
            ("Resume Upload", self.test_resume_upload),
            ("Get Resumes", self.test_get_resumes),
            ("Resume Screening", self.test_resume_screening),
            ("Interview Start", self.test_interview_functionality),
            ("Get Interview Session", self.test_get_interview_session),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
                time.sleep(0.5)
            except Exception as e:
                self.log(f"❌ {test_name} - Exception: {str(e)}")
                self.failed_tests.append({
                    "test": test_name,
                    "error": str(e)
                })
        
        # Print summary
        self.log("=" * 60)
        self.log(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            self.log("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                test_name = failure['test']
                if 'error' in failure:
                    error_msg = failure['error']
                else:
                    error_msg = f"Status {failure.get('actual')} (expected {failure.get('expected')})"
                self.log(f"   - {test_name}: {error_msg}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"\n✅ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = AIHRAgentTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test suite failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())