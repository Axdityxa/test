import { useEffect, useState } from 'react';
import axios from 'axios';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Container, Grid } from 'lucide-react';
// import { Button, Textarea, Checkbox, Container, Grid } from 'shadcn-ui';



interface Question {
  id: number;
  questionText: string;
  questionType: 'MCQ' | 'FILL_IN_THE_BLANKS' | 'MATCH_THE_FOLLOWING';
  answers: { id: number; answerText: string }[];
}

interface Section {
  id: number;
  questions: Question[];
}

interface Test {
  id: number;
  sections: Section[];
}

const TestPage = ({ testId }: { testId: string }) => {
  const [testData, setTestData] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timer, setTimer] = useState(300); // 5 minutes
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchTestData = async () => {
      const response = await axios.get(`/api/tests/${testId}`);
      setTestData(response.data);
    };

    fetchTestData();

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(countdown);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [testId]);

  const handleChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    // Handle submission logic (e.g., save answers to database)
    setSubmitted(true);
  };

  if (!testData) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      {!submitted ? (
        <Grid className="h-screen grid-cols-2">
          <div className="overflow-y-scroll p-4">
            <h2>Passage</h2>
            <p>This is where the passage text will be displayed.</p>
          </div>

          <div className="overflow-y-scroll p-4">
            <h2>Questions</h2>
            {testData.sections.map((section) =>
              section.questions.map((question) => (
                <div key={question.id}>
                  <h3>{question.questionText}</h3>
                  {question.questionType === 'MCQ' &&
                    question.answers.map((answer) => (
                      <div key={answer.id}>
                        <Checkbox
                          checked={answers[question.id] === answer.answerText}
                          onChange={() => handleChange(question.id, answer.answerText)}
                        >
                          {answer.answerText}
                        </Checkbox>
                      </div>
                    ))}
                  {question.questionType === 'FILL_IN_THE_BLANKS' && (
                    <Textarea
                      onChange={(e) => handleChange(question.id, e.target.value)}
                      placeholder="Type your answer here"
                    />
                  )}
                </div>
              ))
            )}
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </Grid>
      ) : (
        <h2>Your test has been submitted. Check results here...</h2>
      )}
      <h2>
        Time Remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </h2>
    </Container>
  );
};

export default TestPage;

export async function getServerSideProps(context: { params: { id: string } }) {
  const { id } = context.params;
  return {
    props: { testId: id },
  };
}
