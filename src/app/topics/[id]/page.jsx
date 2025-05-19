'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createQuestion, updateQuestion, deleteQuestion, getQuestionsOfTopic } from '../../../lib/questions';
import { getTopicDetails } from '../../../lib/topics';
import { decodeHtml } from '../../../plugins/decodeHTMLentities';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Breadcrumb from '../../../components/Breadcrumb';
import TimeFormating from '../../../components/TimeFormating';
import SideBar from '../../../components/SideBar';
import ReplyInputBox from '../../../components/ReplyInputBox';
import CardWithTitleAndImage from '../../../components/CardWithTitleAndImage';
import { getRecentQuestions } from '../../../lib/questions';
import LoadMoreButton from '../../../components/LoadMoreButton';

export default function TopicPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [topic, setTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [recentTopics, setRecentTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newQuestionContent, setNewQuestionContent] = useState('');
    const [newQuestionTitle, setNewQuestionTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [activeTab, setActiveTab] = useState('published');
    const [publishedPage, setPublishedPage] = useState(1);
    const [hasMorePublished, setHasMorePublished] = useState(true);

    useEffect(() => {
        const fetchTopic = async () => {
            try {
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('token='))?.split('=')[1];
                const res = await getTopicDetails(id, 1, 5, token);
                console.log(res);
                if (res.status === 200) {
                    const topicData = res.data;
                    setTopic(topicData);
                    setQuestions(topicData.topics);
                } else {
                    setError('Failed to load topic');
                }

                const recentTopicsRes = await getRecentQuestions(5);
                if (recentTopicsRes.status === 200) {
                    const recentTopicsData = recentTopicsRes.data;
                    setRecentTopics(recentTopicsData);
                } else {
                    setError('Failed to load recent topics');
                }
            } catch (err) {
                setError('Failed to load topic');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTopic();
        }
    }, [id]);

    const handleAddQuestion = async () => {
        setIsSubmitting(true);
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                .split('=')[1];
            if (editingQuestionId) {
                await updateQuestion(editingQuestionId, { content: newQuestionContent, status: 'publish' }, token);
                setEditingQuestionId(null);
            } else {
                await createQuestion(id, newQuestionTitle, newQuestionContent, token, 'publish');
            }
            const updatedTopicData = await getTopicDetails(id, 1, 5, token);
            if (updatedTopicData.status === 200) {
                setQuestions(updatedTopicData.data.topics);
            }
            setNewQuestionContent('');
            setNewQuestionTitle('');
        } catch (err) {
            console.error('Failed to add or update question:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                .split('=')[1];
            await deleteQuestion(questionId, token);
            const updatedTopicData = await getTopicDetails(id, 1, 5, token);
            if (updatedTopicData.status === 200) {
                setQuestions(updatedTopicData.data.topics);
            }
        } catch (err) {
            console.error('Failed to delete question:', err);
        }
    };

    const handleEditQuestion = (question) => {
        setEditingQuestionId(question.id);
        setNewQuestionTitle(question.title);
        setNewQuestionContent(question.excerpt);
    };

    const loadMorePublishedQuestions = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                .split('=')[1];
            const newPage = publishedPage + 1;
            const newQuestions = await getTopicDetails(id, newPage, 5, token);
            if (newQuestions.status === 200 && newQuestions.data.topics.length > 0) {
                setQuestions(prevQuestions => [...prevQuestions, ...newQuestions.data.topics]);
                setPublishedPage(newPage);
            } else {
                setHasMorePublished(false);
            }
        } catch (err) {
            console.error('Failed to load more questions:', err);
        }
    };

    const handleSaveDraft = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                .split('=')[1];
            await createQuestion(id, newQuestionTitle, newQuestionContent, token, 'draft');
            const updated = await getTopicDetails(id, 1, 5, token);
            if (updated.status === 200) {
                setQuestions(updated.data.topics);
            }
            setNewQuestionContent('');
            setNewQuestionTitle('');
            setActiveTab('drafts');
        } catch (err) {
            console.error('Failed to save draft:', err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner />
        </div>
    );
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!topic) return <div className="p-4">Topic not found</div>;

    const paths = ['Home', 'Topics', topic.forum.title];

    return (
        <div className="max-w-[80%] mx-auto p-4 mt-8">
            <Breadcrumb paths={paths} />

            <h1 className="text-4xl font-bold mb-6">{decodeHtml(topic.forum.title)}</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div
                    className="text-gray-600 mb-4"
                    dangerouslySetInnerHTML={{ __html: decodeHtml(topic.forum.content) }}
                />
                <div className="text-sm text-gray-500 flex justify-between items-center">
                    <span>
                        <TimeFormating date={topic.forum.date} />
                    </span>
                </div>
            </div>

            <div className="flex space-x-6">
                <div className="w-[80%] space-y-4">
                <h2 className="text-xl font-semibold">Create New Question</h2>
                                <ReplyInputBox
                                    replyContent={newQuestionContent}
                                    setReplyContent={setNewQuestionContent}
                                    onSubmit={handleAddQuestion}
                                    onSaveDraft={handleSaveDraft}
                                    isSubmitting={isSubmitting}
                                    draftReplies={[]}
                                    error={null}
                                    draftError={null}
                                    onErrorClose={() => {}}
                                    onDraftErrorClose={() => {}}
                                    type="question"
                                    title={newQuestionTitle}
                                    setTitle={setNewQuestionTitle}
                                    titleRequired={true}

                                />
                    <div className="flex space-x-4 mb-10">
                        <motion.button
                            onClick={() => setActiveTab('published')}
                            className={`text-md bg-white px-4 py-2 rounded-[7px] ${activeTab === 'published' ? 'text-white bg-[#6E4BEB]' : 'text-gray-500'}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                                backgroundColor: activeTab === 'published' ? '#6E4BEB' : '#FFFFFF',
                                x: 0,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            Published
                        </motion.button>
                        <motion.button
                            onClick={() => setActiveTab('drafts')}
                            className={`text-md bg-white px-4 py-2 rounded-[7px] ${activeTab === 'drafts' ? 'text-white bg-[#6E4BEB]' : 'text-gray-500'}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                                backgroundColor: activeTab === 'drafts' ? '#6E4BEB' : '#FFFFFF',
                                x: 0,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            Drafts
                        </motion.button>
                    </div>

                    <AnimatePresence exitBeforeEnter>
                        {activeTab === 'published' && (
                            <motion.div
                                key="published"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-xl font-semibold mb-4">Published Questions</h2>
                                {questions.filter(q => q.status === 'publish').length === 0 ? (
                                    <p className="text-gray-500">No published questions yet</p>
                                ) : (
                                    <>
                                        {questions.filter(q => q.status === 'publish').map((question, index) => (
                                            <div key={question.id} className="flex items-center justify-between">
                                                <CardWithTitleAndImage
                                                    title={decodeHtml(question.title)}
                                                    author={question.author}
                                                    date={question.date}
                                                    description={question.excerpt ? question.excerpt : question.latest_reply ? `<strong>${question.latest_reply.author.name}</strong> replied: ${question.latest_reply.content.rendered}` : ''}
                                                    link={{
                                                        pathname: `/questions/${question.slug}?id=${question.id}`,
                                                        query: { id: question.id }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <LoadMoreButton
                                            onClick={loadMorePublishedQuestions}
                                            isLoading={false}
                                            hasMore={hasMorePublished}
                                        />
                                    </>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'drafts' && (
                            <motion.div
                                key="drafts"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-xl font-semibold mb-4">Draft Questions</h2>
                                {questions.filter(q => q.status === 'draft').length === 0 ? (
                                    <p className="text-gray-500">No draft questions yet</p>
                                ) : (
                                    questions.filter(q => q.status === 'draft').map((question, index) => (
                                        <div key={question.id} className="flex items-center justify-between">
                                            <CardWithTitleAndImage
                                                title={decodeHtml(question.title)}
                                                author={question.author}
                                                date={question.date}
                                                description={question.excerpt ? question.excerpt : question.latest_reply ? `<strong>${question.latest_reply.author.name}</strong> replied: ${question.latest_reply.content.rendered}` : ''}
                                                link={{
                                                    pathname: `/questions/${question.slug}?id=${question.id}`,
                                                    query: { id: question.id }
                                                }}
                                                showEditButton={true}
                                                showDeleteButton={true}
                                                onEdit={() => handleEditQuestion(question)}
                                                onDelete={() => handleDeleteQuestion(question.id)}
                                                status="draft"
                                            />
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <SideBar
                    loading={loading}
                    error={error}
                    items={recentTopics}
                    title="Recent Topics"
                    linkPrefix="questions"
                />
            </div>
        </div>
    );
}